import { randomBytes } from 'node:crypto'
import { mkdir, open, writeFile } from 'node:fs/promises'

await mkdir('.data/media', { recursive: true })
try {
  const database = await open('.data/portfolio.db', 'ax')
  await database.close()
} catch (error) {
  if (error.code !== 'EEXIST') throw error
}
const secret = randomBytes(48).toString('base64url')
try {
  await writeFile('.env', `DATABASE_URL=file:./.data/portfolio.db\nBETTER_AUTH_SECRET=${secret}\nBETTER_AUTH_URL=http://localhost:3000\nOWNER_USER_ID=\nMEDIA_DIRECTORY=.data/media\n`, { flag: 'wx', mode: 0o600 })
  console.log('Konfigurasi lokal dibuat. Secret tidak ditampilkan.')
} catch (error) {
  if (error.code !== 'EEXIST') throw error
  console.log('Konfigurasi lokal sudah ada dan dipertahankan.')
}
