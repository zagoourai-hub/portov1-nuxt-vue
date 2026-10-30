import assert from 'node:assert/strict'
import { test } from 'node:test'
import { confirmDiscardChanges } from '../app/utils/unsavedChanges.ts'

test('discard confirmation protects edited translations and gallery', () => {
  const form = { translations: { id: { title: 'Awal' }, en: { title: 'Initial' } }, images: [] }
  const saved = JSON.stringify(form)
  assert.equal(confirmDiscardChanges(form, saved, () => {
    throw new Error('Unexpected confirmation')
  }), true)
  form.translations.en.title = 'Updated'
  assert.equal(confirmDiscardChanges(form, saved, () => false), false)
  assert.equal(confirmDiscardChanges(form, saved, () => true), true)
  form.translations.en.title = 'Initial'
  form.images.push({ mediaId: 'image' })
  assert.equal(confirmDiscardChanges(form, saved, () => false), false)
})
