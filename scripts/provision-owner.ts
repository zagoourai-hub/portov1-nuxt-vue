import { createInterface } from 'node:readline/promises'
import { randomUUID } from 'node:crypto'
import { readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { createOwnerAuth } from '../server/utils/auth.ts'
import { db } from '../server/utils/db.ts'
import { z } from 'zod'
import { readOwnerPassword } from './read-owner-password.ts'

if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Jalankan dari terminal interaktif; password tidak boleh diberikan melalui argumen atau pipe.')
const resetting = process.argv[2] === '--reset'
if (process.argv.length > (resetting ? 3 : 2)) throw new Error('Argumen tidak dikenal.')
if (!resetting && await db().user.count()) throw new Error('Akun sudah tersedia. Provisioning awal tidak dapat dijalankan ulang.')
const terminal = createInterface({ input: process.stdin, output: process.stdout })
const email = z.email().parse((await terminal.question('Email pemilik: ')).trim())
terminal.close()
if (resetting) {
  const owner = process.env.OWNER_USER_ID && await db().user.findUnique({ where: { id: process.env.OWNER_USER_ID } })
  if (!owner || owner.email !== email) throw new Error('Akun pemilik tidak cocok dengan konfigurasi.')
}

const password = await readOwnerPassword(process.stdin, process.stdout)

try {
  if (resetting) {
    let token = ''
    const localAuth = createOwnerAuth(false, (value) => {
      token = value
    })
    await localAuth.api.requestPasswordReset({ body: { email } })
    if (!token) throw new Error('Token pemulihan tidak dapat dibuat.')
    await localAuth.api.resetPassword({ body: { token, newPassword: password } })
    console.log('Password diperbarui dan sesi lama dicabut. Silakan login kembali.')
  } else {
    const result = await createOwnerAuth(true).api.signUpEmail({ body: { email, password, name: 'Pemilik Portfolio' } })
    const temporary = '.env.owner-' + randomUUID()
    try {
      const before = await stat('.env')
      const source = await readFile('.env', 'utf8')
      const setting = 'OWNER_USER_ID=' + result.user.id
      const updated = /^OWNER_USER_ID=.*$/m.test(source) ? source.replace(/^OWNER_USER_ID=.*$/m, setting) : source + '\n' + setting + '\n'
      await writeFile(temporary, updated, { flag: 'wx', mode: 0o600 })
      const after = await stat('.env')
      if (before.mtimeMs !== after.mtimeMs || before.size !== after.size) throw new Error('Konfigurasi berubah selama provisioning.')
      await rename(temporary, '.env')
      console.log('Akun pemilik dibuat. Restart server, lalu buka /admin/login. Password tidak disimpan atau ditampilkan.')
    } catch (error) {
      console.error('Akun sudah dibuat, tetapi konfigurasi gagal disimpan. Atur OWNER_USER_ID menjadi ' + result.user.id + ' di .env secara manual.')
      throw error
    } finally {
      await rm(temporary, { force: true })
    }
  }
} finally {
  await db().$disconnect()
}
