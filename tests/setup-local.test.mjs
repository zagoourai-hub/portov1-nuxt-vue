import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join, resolve, sep } from 'node:path'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'

test('local setup creates configuration and preserves existing database and secrets', async () => {
  const root = resolve('.data')
  await mkdir(root, { recursive: true })
  const temporary = await mkdtemp(join(root, 'setup-test-'))
  const script = resolve('scripts/setup-local.mjs')
  try {
    await mkdir(join(temporary, '.data'))
    const database = join(temporary, '.data', 'portfolio.db')
    await writeFile(database, 'existing data')
    const run = () => spawnSync(process.execPath, [script], { cwd: temporary, encoding: 'utf8' })
    assert.equal(run().status, 0)
    const env = join(temporary, '.env')
    const hash = async () => createHash('sha256').update(await readFile(env)).digest('hex')
    const first = await hash()
    assert.equal(run().status, 0)
    assert.equal(await hash(), first, 'Repeated setup must retain the generated secret')
    assert.equal(await readFile(database, 'utf8'), 'existing data')
  } finally {
    assert.ok(temporary.startsWith(root + sep) && temporary.includes(sep + 'setup-test-'))
    await rm(temporary, { recursive: true, force: true })
  }
})
