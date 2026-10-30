import { createHash } from 'node:crypto'
import { defineEventHandler, getRequestIP, setHeader } from 'h3'
import { limitRequest } from '../utils/rateLimit'

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0] ?? ''
  if (!path.startsWith('/api/public/') && !path.startsWith('/api/media/') && !/^\/(id|en)(?:\/|$)/.test(path)) return
  const ip = getRequestIP(event, { xForwardedFor: false })
  // SSR's internal fetch has no remote socket; the outer page request is already limited.
  if (!ip) return
  const key = createHash('sha256').update(ip).digest('hex')
  try {
    await limitRequest('public:' + key, 120, 60)
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error && error.statusCode === 429) setHeader(event, 'Retry-After', 60)
    throw error
  }
})
