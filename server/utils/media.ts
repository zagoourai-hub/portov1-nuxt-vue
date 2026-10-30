import { randomUUID } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, rename, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import busboy from 'busboy'
import sharp from 'sharp'
import { PDFDocument } from 'pdf-lib'
import { createError, sendStream, setHeader, setResponseStatus } from 'h3'
import type { H3Event } from 'h3'
import { db } from './db.ts'
import { lockContent } from './content.ts'
import { limitRequest } from './rateLimit.ts'

const directory = () => resolve(process.env.MEDIA_DIRECTORY || '.data/media')
const mediaPath = (key: string) => {
  if (!/^[a-f0-9-]{36}$/.test(key)) throw createError({ statusCode: 404 })
  return resolve(directory(), key)
}

function readUpload(event: H3Event): Promise<{ buffer: Buffer, kind: 'IMAGE' | 'PDF' }> {
  return new Promise((resolveUpload, reject) => {
    let kind: 'IMAGE' | 'PDF' | undefined
    let fileCount = 0
    let size = 0
    let received = 0
    const chunks: Buffer[] = []
    const parser = busboy({ headers: event.node.req.headers, limits: { fileSize: 10_000_000, files: 1, fields: 1, parts: 3, fieldSize: 10 } })
    const fail = (statusCode: number, message: string) => {
      parser.destroy(createError({
        statusCode, message
      }))
    }
    const onData = (chunk: Buffer) => {
      received += chunk.length
      if (received > 11_000_000) fail(413, 'File terlalu besar')
    }
    const cleanup = () => {
      event.node.req.off('data', onData)
      event.node.req.setTimeout(0)
    }
    event.node.req.setTimeout(60_000, () => fail(408, 'Upload melewati batas waktu'))
    event.node.req.on('data', onData)
    event.node.req.once('aborted', () => fail(400, 'Upload dibatalkan'))
    parser.on('field', (name, value) => {
      if (name !== 'kind' || !['IMAGE', 'PDF'].includes(value)) return fail(400, 'Jenis media tidak valid')
      kind = value as 'IMAGE' | 'PDF'
    })
    parser.on('file', (name, file) => {
      fileCount++
      if (name !== 'file') return fail(400, 'Field file tidak valid')
      file.on('data', (chunk: Buffer) => {
        size += chunk.length
        chunks.push(chunk)
      })
      file.on('limit', () => fail(413, 'File terlalu besar'))
      file.on('error', error => parser.destroy(error))
    })
    for (const limit of ['filesLimit', 'fieldsLimit', 'partsLimit']) parser.on(limit, () => fail(400, 'Kirim satu file dan jenis media'))
    parser.once('error', (error) => {
      cleanup()
      event.node.req.unpipe(parser)
      event.node.req.resume()
      reject(error)
    })
    parser.once('close', () => {
      cleanup()
      if (!kind || fileCount !== 1 || !size) return reject(createError({ statusCode: 400, message: 'File dan jenis media wajib diisi' }))
      if (size > (kind === 'IMAGE' ? 5_000_000 : 10_000_000)) return reject(createError({ statusCode: 413, message: 'File terlalu besar' }))
      resolveUpload({ buffer: Buffer.concat(chunks), kind })
    })
    event.node.req.pipe(parser)
  })
}

async function validateFile(buffer: Buffer, kind: 'IMAGE' | 'PDF') {
  if (kind === 'PDF') {
    if (!buffer.subarray(0, 5).equals(Buffer.from('%PDF-')) || !buffer.subarray(-1024).includes(Buffer.from('%%EOF'))) throw createError({ statusCode: 415, message: 'PDF tidak valid' })
    const pdf = await PDFDocument.load(buffer, { updateMetadata: false })
    if (!pdf.getPageCount() || pdf.isEncrypted) throw createError({ statusCode: 415, message: 'PDF kosong atau terenkripsi tidak didukung' })
    return { buffer, mimeType: 'application/pdf' }
  }
  const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const png = buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const webp = buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP'
  if (!jpeg && !png && !webp) throw createError({ statusCode: 415, message: 'Gunakan gambar JPEG, PNG, atau WebP' })
  const image = sharp(buffer, { limitInputPixels: 25_000_000, failOn: 'error', animated: false })
  const info = await image.metadata()
  if (!['jpeg', 'png', 'webp'].includes(info.format ?? '') || (info.pages ?? 1) > 1) throw createError({ statusCode: 415, message: 'Gunakan gambar JPEG, PNG, atau WebP statis' })
  const converted = await image.rotate().webp({ quality: 85 }).toBuffer()
  if (converted.length > 5_000_000) throw createError({ statusCode: 413, message: 'Hasil gambar terlalu besar' })
  return { buffer: converted, mimeType: 'image/webp' }
}

export async function uploadMedia(event: H3Event) {
  await limitRequest('upload:' + process.env.OWNER_USER_ID, 10, 60)
  if (Number(event.node.req.headers['content-length']) > 11_000_000) throw createError({ statusCode: 413, message: 'File terlalu besar' })
  const objectKey = randomUUID()
  const row = await db().$transaction(async (tx) => {
    await lockContent(tx)
    const occupied = await tx.media.aggregate({ _sum: { byteSize: true } })
    if ((occupied._sum.byteSize ?? 0) + 10_000_000 > 500_000_000) throw createError({ statusCode: 413, message: 'Kuota penyimpanan penuh' })
    if (await tx.media.count({ where: { state: 'UPLOADING' } }) >= 2) throw createError({ statusCode: 429, message: 'Tunggu upload yang sedang berjalan' })
    return tx.media.create({ data: { objectKey, kind: 'PDF', mimeType: 'application/octet-stream', byteSize: 10_000_000 } })
  })
  const file = mediaPath(objectKey)
  try {
    const upload = await readUpload(event)
    let result
    try {
      result = await validateFile(upload.buffer, upload.kind)
    } catch (error) {
      if (error && typeof error === 'object' && 'statusCode' in error) throw error
      throw createError({ statusCode: 415, message: 'File rusak atau tidak didukung' })
    }
    await mkdir(directory(), { recursive: true })
    await writeFile(file + '.part', result.buffer, { flag: 'wx', mode: 0o600 })
    await rename(file + '.part', file)
    const saved = await db().media.update({ where: { id: row.id }, data: { state: 'READY', kind: upload.kind, mimeType: result.mimeType, byteSize: result.buffer.length }, select: { id: true, kind: true, mimeType: true, byteSize: true, state: true } })
    setResponseStatus(event, 201)
    return saved
  } catch (error) {
    const cleanup = await Promise.allSettled([rm(file, { force: true }), rm(file + '.part', { force: true })])
    await db().media.update({ where: { id: row.id }, data: { state: 'FAILED', ...(cleanup.every(item => item.status === 'fulfilled') ? { byteSize: 0 } : {}) } })
    throw error
  }
}

export async function deleteMedia(id: string) {
  const row = await db().$transaction(async (tx) => {
    await lockContent(tx)
    const media = await tx.media.findUnique({ where: { id }, include: { _count: { select: { profiles: true, images: true, resumes: true } } } })
    if (!media) throw createError({ statusCode: 404 })
    if (Object.values(media._count).some(Boolean)) throw createError({ statusCode: 409, message: 'Media masih digunakan oleh konten' })
    if (media.state === 'UPLOADING' && Date.now() - media.createdAt.getTime() < 15 * 60_000) throw createError({ statusCode: 409, message: 'Upload masih berlangsung. Coba lagi setelah 15 menit jika upload terputus.' })
    await tx.media.update({ where: { id }, data: { state: 'DELETING' } })
    return media
  })
  const file = mediaPath(row.objectKey)
  await rm(file, { force: true })
  await rm(file + '.part', { force: true })
  await db().media.delete({ where: { id } })
}

export async function streamMedia(event: H3Event, id: string, owner = false) {
  const row = await db().media.findFirst({ where: { id, state: 'READY', ...(owner ? {} : { OR: [{ profiles: { some: { status: 'PUBLISHED' } } }, { images: { some: { project: { status: 'PUBLISHED' } } } }, { resumes: { some: { resume: { status: 'PUBLISHED' } } } }] }) } })
  if (!row) throw createError({ statusCode: 404 })
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Content-Type', row.mimeType)
  setHeader(event, 'Content-Disposition', row.kind === 'PDF' ? 'attachment; filename="curriculum-vitae.pdf"' : 'inline')
  setHeader(event, 'Accept-Ranges', 'none')
  if (event.method === 'HEAD') return ''
  return sendStream(event, createReadStream(mediaPath(row.objectKey)))
}
