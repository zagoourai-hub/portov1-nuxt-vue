import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdtemp, mkdir, copyFile, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { DatabaseSync } from 'node:sqlite'

test('demo seed populates an empty database and refuses to overwrite it', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-seed-'))
  const script = resolve('scripts/seed-demo.ts')
  try {
    await mkdir(join(root, '.data'), { recursive: true })
    await mkdir(join(root, 'app/assets/image'), { recursive: true })
    for (const name of ['developer-anime-v2.png', 'project-urbanix.png', 'project-veloce.png', 'project-woodcraft.png']) {
      await copyFile(resolve('app/assets/image', name), join(root, 'app/assets/image', name))
    }
    const database = new DatabaseSync(join(root, '.data/portfolio.db'))
    database.exec(await readFile(resolve('prisma/migrations/202610280001_initial/migration.sql'), 'utf8'))
    database.close()
    const run = () => spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8', timeout: 90_000 })
    const first = run()
    assert.equal(first.status, 0, first.stderr)
    const second = run()
    assert.notEqual(second.status, 0)
    assert.match(second.stderr, /Database tidak kosong/)
    const result = new DatabaseSync(join(root, '.data/portfolio.db'), { readOnly: true })
    assert.equal(result.prepare('SELECT count(*) AS total FROM Project WHERE status = ?').get('PUBLISHED').total, 3)
    assert.equal(result.prepare('SELECT count(*) AS total FROM Experience WHERE status = ?').get('PUBLISHED').total, 3)
    assert.equal(result.prepare('SELECT count(*) AS total FROM ExperienceTranslation').get().total, 6)
    assert.equal(result.prepare('SELECT count(*) AS total FROM ResumeTranslation').get().total, 2)
    assert.equal(result.prepare('SELECT count(*) AS total FROM Media').get().total, 6)
    result.close()
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})
