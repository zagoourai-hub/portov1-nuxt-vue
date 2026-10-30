import { createError } from 'h3'
import type { Prisma } from '../generated/prisma/client.ts'
import type { ProfileInput, ProjectInput, ExperienceInput, ResumeInput } from '../../shared/portfolio.ts'
import { db } from './db.ts'

type Transaction = Prisma.TransactionClient
export type ContentResource = 'profile' | 'projects' | 'experiences' | 'resume'
export const conflict = () => createError({ statusCode: 409, message: 'Conten berubah atau masih dipublikasikan. Muat ulang; unpublish sebelum mengedit.' })
const missing = () => createError({ statusCode: 404, message: 'Konten tidak ditemukan' })
const incomplete = () => createError({ statusCode: 422, message: 'Lengkapi seluruh field wajib dan kedua bahasa sebelum publikasi' })

export async function lockContent(tx: Transaction) {
  // SQLite serializes writes; acquire the write lock before checking media references or quota.
  await tx.requestLimit.upsert({ where: { key: 'content-lock' }, create: { key: 'content-lock', count: 0, expiresAt: new Date('9999-01-01') }, update: { count: { increment: 0 } } })
}

function editable(row: { version: number, status: string } | null, version: number) {
  if (!row) throw missing()
  if (row.version !== version || row.status !== 'DRAFT') throw conflict()
}

async function readyMedia(tx: Transaction, ids: string[], kind: 'IMAGE' | 'PDF') {
  const unique = [...new Set(ids)]
  if (await tx.media.count({ where: { id: { in: unique }, kind, state: 'READY' } }) !== unique.length) {
    throw createError({ statusCode: 409, message: 'Media belum siap atau tidak sesuai jenisnya' })
  }
}

const translations = <T extends object>(values: { id: T, en: T }) => (['id', 'en'] as const).map(locale => ({ locale, ...values[locale] }))
const date = (value: string) => new Date(value + 'T00:00:00.000Z')

export async function saveProfile(input: ProfileInput) {
  return db().$transaction(async (tx) => {
    await lockContent(tx)
    const row = await tx.profile.findUnique({ where: { singletonKey: 'main' } })
    editable(row, input.version)
    if (input.photoId) await readyMedia(tx, [input.photoId], 'IMAGE')
    const { version, translations: values, ...fields } = input
    return tx.profile.update({ where: { singletonKey: 'main', version }, data: { ...fields, linkedinUrl: fields.linkedinUrl ?? '', version: { increment: 1 }, translations: { deleteMany: {}, create: translations(values) } }, include: { translations: true } })
  })
}

export async function saveProject(input: ProjectInput, id?: string, version?: number) {
  return db().$transaction(async (tx) => {
    await lockContent(tx)
    if (id) {
      const row = await tx.project.findUnique({ where: { id } })
      editable(row, version!)
      if (row?.firstPublishedAt && row.slug !== input.slug) throw createError({ statusCode: 409, message: 'Slug proyek yang pernah dipublikasikan tidak dapat diubah' })
    }
    await readyMedia(tx, input.images.map(image => image.mediaId), 'IMAGE')
    const { translations: values, images, ...fields } = input
    const data = { ...fields, demoUrl: fields.demoUrl || null, repositoryUrl: fields.repositoryUrl || null }
    if (!id) return tx.project.create({ data: { ...data, translations: { create: translations(values) }, images: { create: images } }, include: { translations: true, images: true } })
    return tx.project.update({ where: { id, version }, data: { ...data, version: { increment: 1 }, translations: { deleteMany: {}, create: translations(values) }, images: { deleteMany: {}, create: images } }, include: { translations: true, images: true } })
  })
}

export async function saveExperience(input: ExperienceInput, id?: string, version?: number) {
  return db().$transaction(async (tx) => {
    await lockContent(tx)
    if (id) editable(await tx.experience.findUnique({ where: { id } }), version!)
    const { translations: values, ...fields } = input
    const data = { ...fields, startDate: date(fields.startDate), endDate: fields.endDate ? date(fields.endDate) : null }
    if (!id) return tx.experience.create({ data: { ...data, translations: { create: translations(values) } }, include: { translations: true } })
    return tx.experience.update({ where: { id, version }, data: { ...data, version: { increment: 1 }, translations: { deleteMany: {}, create: translations(values) } }, include: { translations: true } })
  })
}

export async function saveResume(input: ResumeInput) {
  return db().$transaction(async (tx) => {
    await lockContent(tx)
    editable(await tx.resume.findUnique({ where: { singletonKey: 'main' } }), input.version)
    const values = translations(input.translations).filter((item): item is { locale: 'id' | 'en', mediaId: string } => item.mediaId !== null)
    await readyMedia(tx, values.map(item => item.mediaId), 'PDF')
    return tx.resume.update({ where: { singletonKey: 'main', version: input.version }, data: { version: { increment: 1 }, translations: { deleteMany: {}, create: values } }, include: { translations: true } })
  })
}

function complete(values: { locale: string }[], required: string[]) {
  if (!['id', 'en'].every(locale => values.some(value => value.locale === locale && required.every(key => typeof Reflect.get(value, key) === 'string' && Reflect.get(value, key).trim())))) throw incomplete()
}

function transition(row: { version: number, status: string } | null, version: number, publish: boolean) {
  if (!row) throw missing()
  if (row.version !== version || row.status !== (publish ? 'DRAFT' : 'PUBLISHED')) throw conflict()
  return { status: publish ? 'PUBLISHED' as const : 'DRAFT' as const, version: { increment: 1 } }
}

export async function publishContent(resource: ContentResource, id: string | undefined, version: number, publish: boolean) {
  return db().$transaction(async (tx) => {
    await lockContent(tx)
    if (resource === 'profile') {
      const row = await tx.profile.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } })
      const data = transition(row, version, publish)
      if (publish && row) {
        if (!row.name || !row.email || !row.linkedinUrl || !row.photoId) throw incomplete()
        complete(row.translations, ['role', 'summary', 'photoAlt'])
        await readyMedia(tx, [row.photoId], 'IMAGE')
      }
      return tx.profile.update({ where: { singletonKey: 'main', version }, data })
    }
    if (resource === 'resume') {
      const row = await tx.resume.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } })
      const data = transition(row, version, publish)
      if (publish && row) {
        complete(row.translations, ['mediaId'])
        await readyMedia(tx, row.translations.map(value => value.mediaId), 'PDF')
      }
      return tx.resume.update({ where: { singletonKey: 'main', version }, data })
    }
    if (resource === 'projects') {
      const row = await tx.project.findUnique({ where: { id }, include: { translations: true, images: true } })
      const data = transition(row, version, publish)
      if (publish && row) {
        if (!row.images.length || !Array.isArray(row.technologies) || !row.technologies.length || row.images.some(image => !image.altId.trim() || !image.altEn.trim())) throw incomplete()
        complete(row.translations, ['title', 'summary', 'role', 'outcome'])
        await readyMedia(tx, row.images.map(image => image.mediaId), 'IMAGE')
      }
      return tx.project.update({ where: { id, version }, data: { ...data, ...(publish && !row?.firstPublishedAt ? { firstPublishedAt: new Date() } : {}) } })
    }
    const row = await tx.experience.findUnique({ where: { id }, include: { translations: true } })
    const data = transition(row, version, publish)
    if (publish && row) {
      if (!row.company.trim()) throw incomplete()
      complete(row.translations, ['role', 'description'])
    }
    return tx.experience.update({ where: { id, version }, data })
  })
}

export async function deleteContent(resource: 'projects' | 'experiences' | 'skills', id: string, version: number) {
  await db().$transaction(async (tx) => {
    await lockContent(tx)
    if (resource === 'skills') {
      const result = await tx.skill.deleteMany({ where: { id, version } })
      if (!result.count) throw conflict()
    } else if (resource === 'projects') {
      editable(await tx.project.findUnique({ where: { id } }), version)
      await tx.project.delete({ where: { id, version } })
    } else {
      editable(await tx.experience.findUnique({ where: { id } }), version)
      await tx.experience.delete({ where: { id, version } })
    }
  })
}
