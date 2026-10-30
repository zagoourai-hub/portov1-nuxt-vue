import assert from 'node:assert/strict'
import { test } from 'node:test'
import { assetPath } from '../app/utils/assetPath.ts'

test('local assets keep the same URL during SSR and hydration', () => {
  assert.equal(assetPath('/_nuxt/hero.png'), '/_nuxt/hero.png')
  globalThis.window = { location: { href: 'https://example.test/id', origin: 'https://example.test' } }
  try {
    assert.equal(assetPath('https://example.test/_nuxt/hero.png?v=1'), '/_nuxt/hero.png?v=1')
    assert.equal(assetPath('/_nuxt/hero.png'), '/_nuxt/hero.png')
    assert.equal(assetPath('https://cdn.example.test/hero.png'), 'https://cdn.example.test/hero.png')
  } finally {
    delete globalThis.window
  }
})
