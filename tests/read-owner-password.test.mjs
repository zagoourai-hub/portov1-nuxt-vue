import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { test } from 'node:test'
import { readOwnerPassword } from '../scripts/read-owner-password.ts'

test('hidden password prompt retries invalid input without displaying it', async () => {
  const input = new EventEmitter()
  const chunks = ['\n', 'short\r', 'x'.repeat(129) + '\r', 'valid-password-123\r']
  const modes = []
  let output = ''
  input.setEncoding = () => input
  input.setRawMode = value => modes.push(value)
  input.pause = () => input
  input.resume = () => {
    queueMicrotask(() => input.emit('data', chunks.shift()))
    return input
  }
  const password = await readOwnerPassword(input, { write: (text) => {
    output += text
  } })
  assert.equal(password, 'valid-password-123')
  assert.equal(output.includes(password), false)
  assert.equal((output.match(/Silakan coba lagi/g) || []).length, 3)
  assert.deepEqual(modes, [true, false, true, false, true, false, true, false])
  assert.equal(input.listenerCount('data'), 0)
})
