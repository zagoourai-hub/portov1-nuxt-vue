import { createError } from 'h3'
import type { Locale } from '../../shared/portfolio.ts'
import { db } from './db.ts'

export async function publicProfile(locale: Locale) {
  const row = await db().profile.findFirst({ where: { status: 'PUBLISHED' }, include: { translations: { where: { locale } } } })
  const content = row?.translations[0]
  if (!row || !content) return null
  return { name: row.name, email: row.email, linkedinUrl: row.linkedinUrl, role: content.role, summary: content.summary, photoAlt: content.photoAlt, photoUrl: row.photoId ? '/api/media/' + row.photoId : null }
}

export async function publicProjects(locale: Locale, page = 1, pageSize = 20, featured?: boolean) {
  const where = { status: 'PUBLISHED' as const, ...(featured === undefined ? {} : { featured }) }
  const [rows, total] = await Promise.all([
    db().project.findMany({ where, orderBy: [{ position: 'asc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize, include: { translations: { where: { locale } }, images: { orderBy: [{ position: 'asc' }, { id: 'asc' }], take: 1 } } }),
    db().project.count({ where })
  ])
  return { data: rows.map(row => ({ id: row.id, slug: row.slug, title: row.translations[0]?.title ?? '', summary: row.translations[0]?.summary ?? '', technologies: Array.isArray(row.technologies) ? row.technologies.filter((value): value is string => typeof value === 'string') : [], featured: row.featured, position: row.position, cover: row.images[0] ? { url: '/api/media/' + row.images[0].mediaId, alt: locale === 'id' ? row.images[0].altId : row.images[0].altEn } : null })), meta: { page, pageSize, total } }
}

export async function publicProject(locale: Locale, slug: string) {
  const row = await db().project.findFirst({ where: { slug, status: 'PUBLISHED' }, include: { translations: { where: { locale } }, images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } } })
  const content = row?.translations[0]
  if (!row || !content) throw createError({ statusCode: 404, message: 'Proyek tidak ditemukan' })
  return { id: row.id, slug: row.slug, title: content.title, summary: content.summary, role: content.role, outcome: content.outcome, technologies: Array.isArray(row.technologies) ? row.technologies.filter((value): value is string => typeof value === 'string') : [], demoUrl: row.demoUrl, repositoryUrl: row.repositoryUrl, images: row.images.map(image => ({ url: '/api/media/' + image.mediaId, alt: locale === 'id' ? image.altId : image.altEn })) }
}

export async function publicExperiences(locale: Locale, page = 1, pageSize = 20) {
  const where = { status: 'PUBLISHED' as const }
  const [rows, total] = await Promise.all([
    db().experience.findMany({ where, orderBy: [{ position: 'asc' }, { id: 'asc' }], skip: (page - 1) * pageSize, take: pageSize, include: { translations: { where: { locale } } } }),
    db().experience.count({ where })
  ])
  return { data: rows.map(row => ({ id: row.id, company: row.company, startDate: row.startDate.toISOString().slice(0, 10), endDate: row.endDate?.toISOString().slice(0, 10) ?? null, role: row.translations[0]?.role ?? '', description: row.translations[0]?.description ?? '' })), meta: { page, pageSize, total } }
}

export async function publicResume(locale: Locale) {
  const row = await db().resume.findFirst({ where: { status: 'PUBLISHED' }, include: { translations: { where: { locale } } } })
  return row?.translations[0] ? { downloadUrl: '/api/media/' + row.translations[0].mediaId } : null
}
