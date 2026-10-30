import { randomUUID } from 'node:crypto'
import { defineEventHandler, setHeader, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'
import { ZodError } from 'zod'

export function safeApi<T>(handler: (event: H3Event) => T | Promise<T>) {
  return defineEventHandler(async (event) => {
    setHeader(event, 'Cache-Control', 'no-store')
    try {
      return await handler(event)
    } catch (error) {
      const requestId = randomUUID()
      const status = error instanceof ZodError ? 400 : error && typeof error === 'object' && 'statusCode' in error ? Number(error.statusCode) : 500
      const code = error && typeof error === 'object' && 'code' in error ? error.code : ''
      const statusCode = code === 'P2002' || code === 'P2034' ? 409 : code === 'P2025' ? 404 : status
      setResponseStatus(event, statusCode)
      if (statusCode === 429) setHeader(event, 'Retry-After', 60)
      const message = statusCode >= 500 ? 'Layanan sementara tidak tersedia. Coba kembali.' : error instanceof ZodError ? 'Periksa format dan kelengkapan input' : code === 'P2002' ? 'Slug atau nama sudah digunakan' : code === 'P2034' ? 'Perubahan bersamaan terdeteksi. Muat ulang dan coba kembali.' : code === 'P2025' ? 'Konten tidak ditemukan' : error instanceof Error ? error.message : 'Permintaan ditolak'
      return { error: { code: statusCode === 409 ? 'CONFLICT' : 'REQUEST_FAILED', message, ...(error instanceof ZodError ? { fields: Object.fromEntries(error.issues.map(issue => [issue.path.join('.'), issue.message])) } : {}) }, requestId }
    }
  })
}
