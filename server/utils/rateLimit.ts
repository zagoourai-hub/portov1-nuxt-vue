import { createError } from 'h3'
import { db } from './db.ts'

export async function limitRequest(key: string, max: number, seconds: number) {
  const now = new Date()
  const count = await db().$transaction(async (tx) => {
    await tx.requestLimit.deleteMany({ where: { expiresAt: { lte: now } } })
    const row = await tx.requestLimit.upsert({ where: { key }, create: { key, count: 1, expiresAt: new Date(now.getTime() + seconds * 1000) }, update: { count: { increment: 1 } } })
    return row.count
  })
  if (count > max) throw createError({ statusCode: 429, message: 'Terlalu banyak permintaan. Coba kembali sebentar lagi.', data: { retryAfter: seconds } })
}
