import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { resolve, join, sep } from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import { DatabaseSync } from 'node:sqlite'
import { setTimeout as delay } from 'node:timers/promises'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'

test('SQLite portfolio: authentication, bilingual publishing, private files, conflicts, and limits', { timeout: 120_000 }, async (t) => {
  const dataRoot = resolve('.data')
  await mkdir(dataRoot, { recursive: true })
  const temporary = await mkdtemp(join(dataRoot, 'test-'))
  const port = 3157
  const base = `http://127.0.0.1:${port}`
  process.env.DATABASE_URL = 'file:' + join(temporary, 'test.db').replaceAll('\\', '/')
  process.env.BETTER_AUTH_SECRET = randomBytes(48).toString('base64url')
  process.env.BETTER_AUTH_URL = base
  process.env.MEDIA_DIRECTORY = join(temporary, 'media')
  new DatabaseSync(join(temporary, 'test.db')).close()
  const migration = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: process.env, encoding: 'utf8' })
  assert.equal(migration.status, 0, 'Isolated test database must migrate successfully: ' + migration.stderr)
  const { db } = await import('../server/utils/db.ts')
  const { createOwnerAuth } = await import('../server/utils/auth.ts')
  const password = randomBytes(24).toString('base64url')
  const owner = await createOwnerAuth(true).api.signUpEmail({ body: { email: 'owner@example.test', password, name: 'Test Owner' } })
  const other = await createOwnerAuth(true).api.signUpEmail({ body: { email: 'other@example.test', password, name: 'Other User' } })
  process.env.OWNER_USER_ID = owner.user.id
  const server = spawn(process.execPath, ['.output/server/index.mjs'], { env: { ...process.env, PORT: String(port), HOST: '127.0.0.1' }, stdio: ['ignore', 'pipe', 'pipe'] })
  let serverOutput = ''
  for (const stream of [server.stdout, server.stderr]) stream.on('data', (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-6000)
  })
  let cookie = ''
  const request = (path, options = {}) => fetch(base + path, { signal: AbortSignal.timeout(12_000), ...options, headers: { Origin: base, ...(cookie ? { Cookie: cookie } : {}), ...options.headers } })
  const json = async (path, method, body, expected = 200) => {
    const response = await request(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    assert.equal(response.status, expected, `${method} ${path}`)
    return response.status === 204 ? null : response.json()
  }
  const upload = async (bytes, kind, name, expected = 201) => {
    const body = new FormData()
    body.append('kind', kind)
    body.append('file', new Blob([bytes]), name)
    const response = await request('/api/admin/media', { method: 'POST', body })
    assert.equal(response.status, expected, 'Upload ' + name)
    return response.json()
  }
  const login = async (email, chosenPassword = password) => {
    const response = await request('/api/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: chosenPassword, rememberMe: false }) })
    assert.equal(response.status, 200, 'Fixture login must work')
    return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
  }
  try {
    let ready = false
    for (let attempt = 0; attempt < 100; attempt++) {
      try {
        if ((await fetch(base + '/admin/login', { signal: AbortSignal.timeout(2000) })).ok) {
          ready = true
          break
        }
      } catch {
        if (server.exitCode !== null) break
      }
      await delay(100)
    }
    assert.ok(ready, 'Built test server must start: ' + serverOutput)
    await t.test('SSR assets and public locale routes work from a production build', async () => {
      const redirect = await fetch(base, { redirect: 'manual' })
      assert.equal(redirect.status, 302)
      assert.equal(redirect.headers.get('location'), '/id')
      for (const locale of ['id', 'en']) {
        const response = await fetch(`${base}/${locale}`)
        assert.equal(response.status, 200)
        const html = await response.text()
        assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`))
        for (const [pattern, mime] of [[/href="([^"]*entry\.[^"]+\.css)"/, /text\/css/], [/src="([^"]*developer-anime-v2[^"]+\.png)"/, /image\/png/], [/src="([^"]+\.js)"/, /(?:javascript|ecmascript)/]]) {
          const url = html.match(pattern)?.[1]
          assert.ok(url, 'Production asset must be referenced in HTML')
          const asset = await fetch(new URL(url, base))
          assert.equal(asset.status, 200, url)
          assert.match(asset.headers.get('content-type') || '', mime)
        }
      }
    })
    cookie = await login(owner.user.email)
    await t.test('owner guard, closed registration, and same-origin mutations', async () => {
      assert.equal((await request('/api/admin/profile', { headers: { Cookie: '' } })).status, 401)
      await json('/api/auth/sign-up/email', 'POST', { email: 'public@example.test', password, name: 'Public' }, 400)
      assert.equal(await db().user.count(), 2, 'Closed registration must not create another account')
      const outsider = await login(other.user.email)
      assert.equal((await request('/api/admin/overview', { headers: { Cookie: outsider } })).status, 403)
      cookie = await login(owner.user.email)
      assert.equal((await request('/api/admin/session')).status, 200)
      const admin = await request('/admin/profile')
      assert.equal(admin.status, 200)
      assert.match(await admin.text(), /Profil &amp; kontak/)
      assert.equal((await request('/api/admin/skills', { method: 'POST', headers: { 'Origin': 'https://invalid.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Bad', position: 0 }) })).status, 403)
      await json('/api/admin/skills', 'POST', { name: 'TypeScript', position: 0, extra: 'rejected' }, 400)
    })
    const image = await sharp({ create: { width: 12, height: 12, channels: 3, background: '#f9233e' } }).png().toBuffer()
    let imageId
    await t.test('valid images are normalized, private, and protected from path traversal', async () => {
      const result = await upload(image, 'IMAGE', '../../test.png')
      imageId = result.data.id
      assert.equal(result.data.mimeType, 'image/webp')
      assert.equal(result.data.objectKey, undefined)
      assert.equal((await request('/api/media/' + imageId)).status, 404)
      assert.equal((await request('/api/media/' + imageId, { method: 'HEAD' })).status, 404)
      assert.equal((await request('/api/admin/media/' + imageId + '/file')).status, 200)
      const extraPart = new FormData()
      extraPart.append('kind', 'IMAGE')
      extraPart.append('file', new Blob([image]), 'test.png')
      extraPart.append('unexpected', 'value')
      assert.equal((await request('/api/admin/media', { method: 'POST', body: extraPart })).status, 400)
      await upload(Buffer.from('<svg onload="alert(1)"/>'), 'IMAGE', 'fake.png', 415)
    })
    let projectId
    const empty = { title: '', summary: '', role: '', outcome: '' }
    let project = { slug: 'test-project', technologies: [], demoUrl: null, repositoryUrl: null, featured: true, position: 0, translations: { id: empty, en: empty }, images: [] }
    await t.test('draft privacy, bilingual completeness, and optimistic concurrency', async () => {
      const created = await json('/api/admin/projects', 'POST', project, 201)
      projectId = created.data.id
      await json(`/api/admin/projects/${projectId}/publish`, 'POST', { version: 1 }, 422)
      assert.equal((await request('/api/public/projects/test-project?locale=id')).status, 404)
      assert.equal((await request('/id/projects/test-project')).status, 404)
      project = { ...project, technologies: ['Nuxt', 'SQLite'], translations: { id: { title: 'Proyek Uji', summary: 'Ringkasan', role: 'Developer', outcome: 'Hasil pekerjaan' }, en: { title: 'Test Project', summary: 'Summary', role: 'Developer', outcome: 'Project outcome' } }, images: [{ mediaId: imageId, position: 0, altId: 'Gambar uji', altEn: 'Test image' }] }
      await json('/api/admin/projects/' + projectId, 'PUT', { ...project, version: 1 })
      await json('/api/admin/projects/' + projectId, 'PUT', { ...project, version: 1 }, 409)
      await json(`/api/admin/projects/${projectId}/publish`, 'POST', { version: 2 })
      const published = await (await request('/api/public/projects/test-project?locale=en')).json()
      assert.equal(published.data.title, 'Test Project')
      assert.equal(published.data.translations, undefined)
      assert.equal(published.data.status, undefined)
      const media = await request('/api/media/' + imageId)
      assert.equal(media.status, 200)
      assert.equal(media.headers.get('x-content-type-options'), 'nosniff')
      assert.equal(media.headers.get('cache-control'), 'no-store')
      for (const [locale, title] of [['id', 'Proyek Uji'], ['en', 'Test Project']]) {
        const page = await request(`/${locale}/projects/test-project`)
        assert.equal(page.status, 200)
        const html = await page.text()
        assert.ok(html.includes(title))
        assert.ok(html.includes(`href="/${locale === 'id' ? 'en' : 'id'}/projects/test-project"`))
        assert.match(html, /01 \/ 01/)
      }
      await json('/api/admin/projects/' + projectId, 'PUT', { ...project, version: 3 }, 409)
      await json('/api/admin/media/' + imageId, 'DELETE', {}, 409)
      await json('/api/admin/projects', 'POST', project, 409)
      assert.equal((await request('/api/public/projects?locale=id&pageSize=101')).status, 400)
      assert.equal((await request('/api/public/projects?locale=fr')).status, 400)
    })
    await t.test('profile, experiences, skills, and paired CV publication', async () => {
      const profile = { version: 1, name: 'Test Owner', email: 'contact@example.test', linkedinUrl: 'https://www.linkedin.com/in/test-owner', photoId: imageId, translations: { id: { role: 'Pengembang Web', summary: 'Profil Indonesia', photoAlt: 'Foto profil' }, en: { role: 'Web Developer', summary: 'English profile', photoAlt: 'Profile photo' } } }
      await json('/api/admin/profile', 'PUT', profile)
      await json('/api/admin/profile/publish', 'POST', { version: 2 })
      assert.equal((await (await request('/api/public/profile?locale=id')).json()).data.name, 'Test Owner')
      const experience = { company: 'Test Company', startDate: '2024-01-01', endDate: null, position: 0, translations: { id: { role: 'Pengembang', description: 'Pengalaman' }, en: { role: 'Developer', description: 'Experience' } } }
      await json('/api/admin/experiences', 'POST', { ...experience, endDate: '2020-01-01' }, 400)
      const created = await json('/api/admin/experiences', 'POST', experience, 201)
      await json(`/api/admin/experiences/${created.data.id}/publish`, 'POST', { version: 1 })
      assert.equal((await (await request('/api/public/experiences?locale=en')).json()).data[0].endDate, null)
      await json('/api/admin/skills', 'POST', { name: 'TypeScript', position: 0 }, 201)
      await json('/api/admin/skills', 'POST', { name: 'typescript', position: 1 }, 409)
      const pdf = await PDFDocument.create()
      pdf.addPage()
      const bytes = await pdf.save()
      const id = (await upload(bytes, 'PDF', 'cv-id.pdf')).data.id
      const en = (await upload(bytes, 'PDF', 'cv-en.pdf')).data.id
      assert.equal((await request('/api/media/' + id)).status, 404)
      await json('/api/admin/resume', 'PUT', { version: 1, translations: { id: { mediaId: id }, en: { mediaId: null } } })
      await json('/api/admin/resume/publish', 'POST', { version: 2 }, 422)
      await json('/api/admin/resume', 'PUT', { version: 2, translations: { id: { mediaId: id }, en: { mediaId: en } } })
      await json('/api/admin/resume/publish', 'POST', { version: 3 })
      for (const [locale, mediaId] of [['id', id], ['en', en]]) {
        const resume = await (await request('/api/public/resume?locale=' + locale)).json()
        assert.equal(resume.data.downloadUrl, '/api/media/' + mediaId)
        const download = await request(resume.data.downloadUrl)
        assert.equal(download.status, 200)
        assert.match(download.headers.get('content-disposition'), /^attachment/)
      }
      await upload(Buffer.from('not a pdf'), 'PDF', 'broken.pdf', 415)
      assert.equal((await (await request('/api/public/resume?locale=id')).json()).data.downloadUrl, '/api/media/' + id)
      const home = await (await request('/en')).text()
      assert.ok(home.includes('mailto:contact@example.test'))
      assert.ok(home.includes('https://www.linkedin.com/in/test-owner'))
      assert.ok(home.includes('/api/media/' + en))
      assert.ok(!home.includes('objectKey'))
    })
    await t.test('unpublish revokes access; slug remains immutable; unused media can be removed', async () => {
      await json(`/api/admin/projects/${projectId}/unpublish`, 'POST', { version: 3 })
      assert.equal((await request('/api/public/projects/test-project?locale=id')).status, 404)
      await json('/api/admin/projects/' + projectId, 'PUT', { ...project, slug: 'changed-slug', version: 4 }, 409)
      await json('/api/admin/projects/' + projectId, 'DELETE', { version: 4 }, 204)
      await json('/api/admin/profile/unpublish', 'POST', { version: 3 })
      assert.equal((await request('/api/media/' + imageId)).status, 404)
      await json('/api/admin/profile', 'PUT', { version: 4, name: '', email: '', linkedinUrl: '', photoId: null, translations: { id: { role: '', summary: '', photoAlt: '' }, en: { role: '', summary: '', photoAlt: '' } } })
      await json('/api/admin/media/' + imageId, 'DELETE', {}, 204)
      assert.equal((await request('/api/admin/media/' + imageId + '/file')).status, 404)
    })
    await t.test('upload quota, concurrent reservations, oversize rejection, and login throttling', async () => {
      await db().requestLimit.deleteMany({ where: { key: 'upload:' + owner.user.id } })
      const occupied = await db().media.create({ data: { objectKey: randomUUID(), kind: 'PDF', mimeType: 'application/pdf', byteSize: 500_000_000, state: 'FAILED' } })
      await upload(image, 'IMAGE', 'quota.png', 413)
      await db().media.delete({ where: { id: occupied.id } })
      const reservations = await Promise.all([0, 1].map(() => db().media.create({ data: { objectKey: randomUUID(), kind: 'PDF', mimeType: 'application/pdf', byteSize: 10_000_000 } })))
      await upload(image, 'IMAGE', 'concurrent.png', 429)
      await db().media.deleteMany({ where: { id: { in: reservations.map(row => row.id) } } })
      await upload(Buffer.alloc(10_000_001), 'PDF', 'oversize.pdf', 413)
      await db().rateLimit.deleteMany()
      const statuses = []
      for (let index = 0; index < 6; index++) {
        const response = await request('/api/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `192.0.2.${index}` }, body: JSON.stringify({ email: owner.user.email, password: 'incorrect-password' }) })
        statuses.push(response.status)
      }
      assert.ok(statuses.includes(429), 'Spoofed forwarded headers must not bypass login rate limiting')
    })
    await t.test('logout and expired sessions invalidate server-side access', async () => {
      await request('/api/auth/sign-out', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      assert.equal((await request('/api/admin/session')).status, 401)
      await db().rateLimit.deleteMany()
      cookie = await login(owner.user.email)
      await db().session.updateMany({ where: { userId: owner.user.id }, data: { expiresAt: new Date(0) } })
      assert.equal((await request('/api/admin/session')).status, 401)
    })
    await t.test('private password recovery revokes existing sessions', async () => {
      await db().rateLimit.deleteMany()
      cookie = await login(owner.user.email)
      let token = ''
      const recovery = createOwnerAuth(false, (value) => {
        token = value
      })
      await recovery.api.requestPasswordReset({ body: { email: owner.user.email } })
      assert.ok(token, 'Recovery token is delivered only to the private operator process')
      const replacement = randomBytes(24).toString('base64url')
      await recovery.api.resetPassword({ body: { token, newPassword: replacement } })
      assert.equal((await request('/api/admin/session')).status, 401)
      const previous = await request('/api/auth/sign-in/email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: owner.user.email, password }) })
      assert.equal(previous.status, 401)
      cookie = await login(owner.user.email, replacement)
      assert.equal((await request('/api/admin/session')).status, 200)
    })
    await t.test('public SSR and API requests share the real client rate limit', async () => {
      const key = 'public:' + createHash('sha256').update('127.0.0.1').digest('hex')
      await db().requestLimit.upsert({ where: { key }, create: { key, count: 119, expiresAt: new Date(Date.now() + 60_000) }, update: { count: 119, expiresAt: new Date(Date.now() + 60_000) } })
      assert.equal((await request('/id', { headers: { 'X-Forwarded-For': '192.0.2.1' } })).status, 200)
      const blocked = await request('/api/public/projects?locale=id', { headers: { 'X-Forwarded-For': '192.0.2.2' } })
      assert.equal(blocked.status, 429)
      assert.equal(blocked.headers.get('retry-after'), '60')
    })
  } finally {
    server.kill()
    await new Promise(resolveExit => server.exitCode !== null ? resolveExit() : server.once('exit', resolveExit))
    await db().$disconnect()
    assert.ok(temporary.startsWith(dataRoot + sep) && temporary.includes(sep + 'test-'))
    await rm(temporary, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
  }
})
