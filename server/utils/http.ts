import { createError, getHeader, readRawBody, setHeader } from 'h3'
import type { H3Event } from 'h3'
import type { z } from 'zod'
import { auth } from './auth.ts'

export async function requireOwner(event: H3Event) {
  setHeader(event, 'Cache-Control', 'no-store')
  const session = await auth().api.getSession({ headers: event.headers })
  if (!session) throw createError({ statusCode: 401, message: 'Silakan login kembali' })
  if (!process.env.OWNER_USER_ID || session.user.id !== process.env.OWNER_USER_ID) throw createError({ statusCode: 403, message: 'Akses ditolak' })
  if (!['GET', 'HEAD'].includes(event.method) && getHeader(event, 'origin') !== new URL(process.env.BETTER_AUTH_URL!).origin) {
    throw createError({ statusCode: 403, message: 'Origin tidak diizinkan' })
  }
  return session.user
}

export async function parseBody<T extends z.ZodType>(event: H3Event, schema: T): Promise<z.infer<T>> {
  const declared = Number(getHeader(event, 'content-length'))
  if (declared > 262_144) throw createError({ statusCode: 413, message: 'Data terlalu besar' })
  let bytes = 0
  const onData = (chunk: Buffer) => {
    bytes += chunk.length
    if (bytes > 262_144) event.node.req.destroy()
  }
  event.node.req.on('data', onData)
  try {
    const raw = await readRawBody(event)
    if (!raw || Buffer.byteLength(raw) > 262_144) throw createError({ statusCode: 400, message: 'Data tidak valid' })
    return schema.parse(JSON.parse(raw))
  } catch {
    throw createError({ statusCode: bytes > 262_144 ? 413 : 400, message: 'Periksa format dan kelengkapan input' })
  } finally {
    event.node.req.off('data', onData)
  }
}
