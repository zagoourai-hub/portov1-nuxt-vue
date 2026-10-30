import assert from 'node:assert/strict'
import { test } from 'node:test'
import { startScrollMotion } from '../app/utils/scrollMotion.ts'

test('scroll motion respects reduced motion, reveals on re-entry, and cancels on cleanup', () => {
  let reduced = true
  let callback
  let stopped = 0
  let cancelled = 0
  let changes
  const observed = new Set()
  const calls = []
  const element = { animate: (...args) => {
    calls.push(args)
    return { cancel: () => cancelled++ }
  } }
  const floatCalls = []
  const typewriterCalls = []
  const float = { animate: (...args) => {
    floatCalls.push(args)
    return { cancel: () => cancelled++ }
  } }
  const typewriter = { animate: (...args) => {
    typewriterCalls.push(args)
    return { cancel: () => cancelled++ }
  } }
  const originals = { window: globalThis.window, document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver }

  globalThis.window = { matchMedia: () => ({
    matches: reduced,
    addEventListener: (_, listener) => { changes = listener },
    removeEventListener: () => { changes = undefined }
  }) }
  globalThis.document = { querySelectorAll: selector => ({ '[data-reveal]': [element], '[data-float]': [float], '[data-typewriter]': [typewriter] })[selector] }
  globalThis.IntersectionObserver = class {
    constructor(listener) { callback = listener }
    observe(target) { observed.add(target) }
    unobserve(target) { observed.delete(target) }
    disconnect() { stopped++ }
  }

  try {
    startScrollMotion()()
    assert.equal(callback, undefined, 'Reduced motion must skip the observer entirely')
    assert.equal(floatCalls.length, 0)
    assert.equal(typewriterCalls.length, 0)
    reduced = false
    const stop = startScrollMotion()
    assert.equal(floatCalls[0][1].duration, 2200)
    assert.equal(floatCalls[0][0][0].filter, 'blur(12px)')
    assert.equal(floatCalls[1][1].iterations, Infinity)
    assert.match(typewriterCalls[0][1].easing, /^steps/)
    assert.equal(typewriterCalls[0][1].iterations, Infinity)
    assert.match(floatCalls[1][0][1].transform, /rotate/)
    assert.ok(observed.has(element))
    callback([{ target: element, isIntersecting: false }])
    assert.equal(calls.length, 0)
    callback([{ target: element, isIntersecting: true, intersectionRatio: 0.5 }])
    assert.equal(calls.length, 1)
    assert.equal(observed.size, 1, 'Elements remain observed for the next entry')
    assert.deepEqual(calls[0][0].at(-1), { opacity: 1, transform: 'translateY(0)' })
    assert.equal(calls[0][1].duration, 1200)
    assert.equal(calls[0][1].fill, 'backwards', 'Finished animations must release their styles')
    callback([{ target: element, isIntersecting: false }])
    assert.equal(calls[1][1].duration, 900)
    assert.equal(calls[1][0].at(-1).opacity, 0)
    callback([{ target: element, isIntersecting: true, intersectionRatio: 0.5 }])
    assert.equal(calls.length, 3, 'Reveal repeats when the element re-enters')
    assert.equal(cancelled, 2, 'A previous animation is cancelled before replay')
    changes()
    assert.equal(cancelled, 6)
    assert.equal(changes, undefined)
    stop()
    assert.equal(cancelled, 6, 'Repeated cleanup must not cancel the same animation twice')
    assert.equal(stopped, 2)
  } finally {
    for (const [key, value] of Object.entries(originals)) {
      if (value === undefined) delete globalThis[key]
      else globalThis[key] = value
    }
  }
})
