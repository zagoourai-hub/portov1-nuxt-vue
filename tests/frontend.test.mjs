import assert from 'node:assert/strict'
import test from 'node:test'

const baseUrl = process.env.FRONTEND_TEST_URL || 'http://127.0.0.1:3000'

test('root redirects to the Indonesian portfolio', async () => {
  const response = await fetch(baseUrl, { redirect: 'manual' })
  assert.equal(response.status, 302)
  assert.equal(response.headers.get('location'), '/id')
})

for (const [locale, projectLabel] of [['id', 'Lihat Proyek'], ['en', 'Explore Projects']]) {
  test(`${locale} renders the hero, localized CTA, and anime asset on the server`, async () => {
    const response = await fetch(`${baseUrl}/${locale}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`))
    assert.match(html, /id="hero-title"/)
    assert.match(html, /I AM A/)
    assert.match(html, /WEB DEVELOPER/)
    assert.ok(html.includes(projectLabel))
    const asset = html.match(/src="([^"]*developer-anime-v2[^"]*)"/)
    assert.ok(asset, 'The generated anime image must be part of SSR markup')
    const imageResponse = await fetch(new URL(asset[1], baseUrl))
    assert.equal(imageResponse.status, 200)
    assert.match(imageResponse.headers.get('content-type') || '', /image\//)
  })
}

test('unknown locale and project routes return HTTP 404', async () => {
  for (const route of ['/fr', '/id/projects/does-not-exist']) {
    const response = await fetch(baseUrl + route)
    assert.equal(response.status, 404, route)
  }
})

test('language links preserve query parameters', async () => {
  for (const [locale, other] of [['id', 'en'], ['en', 'id']]) {
    const response = await fetch(`${baseUrl}/${locale}?page=2`)
    const html = await response.text()
    assert.match(html, new RegExp(`href="/${other}\\?page=2"`))
  }
})
