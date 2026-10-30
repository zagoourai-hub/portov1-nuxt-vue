import { z } from 'zod'

export const localeSchema = z.enum(['id', 'en'])
export const versionSchema = z.strictObject({ version: z.number().int().positive() })
export const idSchema = z.uuid()
const label = z.string().trim().max(160)
const position = z.number().int().min(0).max(100_000)
const optionalUrl = z.union([z.literal(''), z.url().max(2048).refine(value => new URL(value).protocol === 'https:', 'Gunakan URL HTTPS')]).nullable()
const bilingual = <T extends z.ZodType>(schema: T) => z.strictObject({ id: schema, en: schema })

export const profileSchema = versionSchema.extend({
  name: label,
  email: z.union([z.literal(''), z.email().max(254)]),
  linkedinUrl: optionalUrl.refine(value => !value || ['linkedin.com', 'www.linkedin.com'].includes(new URL(value).hostname), 'Gunakan URL LinkedIn'),
  photoId: idSchema.nullable(),
  translations: bilingual(z.strictObject({ role: label, summary: z.string().trim().max(1000), photoAlt: z.string().trim().max(200) }))
})

export const projectSchema = z.strictObject({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  technologies: z.array(z.string().trim().min(1).max(80)).max(30),
  demoUrl: optionalUrl,
  repositoryUrl: optionalUrl,
  featured: z.boolean(),
  position,
  translations: bilingual(z.strictObject({ title: label, summary: z.string().trim().max(1000), role: label, outcome: z.string().trim().max(10_000) })),
  images: z.array(z.strictObject({ mediaId: idSchema, position, altId: z.string().trim().max(200), altEn: z.string().trim().max(200) })).max(20)
})

const date = z.iso.date()
export const experienceSchema = z.strictObject({
  company: label,
  startDate: date,
  endDate: date.nullable(),
  position,
  translations: bilingual(z.strictObject({ role: label, description: z.string().trim().max(10_000) }))
}).refine(value => !value.endDate || value.endDate >= value.startDate, { path: ['endDate'], message: 'Tanggal akhir mendahului tanggal mulai' })

export const skillSchema = z.strictObject({ name: z.string().trim().min(1).max(80), position })
export const resumeSchema = versionSchema.extend({ translations: bilingual(z.strictObject({ mediaId: idSchema.nullable() })) })
export const listSchema = z.strictObject({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional()
})

export type Locale = z.infer<typeof localeSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type ExperienceInput = z.infer<typeof experienceSchema>
export type ResumeInput = z.infer<typeof resumeSchema>
