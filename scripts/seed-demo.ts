import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { PDFDocument, StandardFonts } from 'pdf-lib'
import { db } from '../server/utils/db.ts'
import { demoExperiences } from './demo-experiences.ts'

process.env.DATABASE_URL = 'file:' + resolve('.data/portfolio.db')
const mediaDirectory = resolve('.data/media')
const createdFiles: string[] = []

try {
  await mkdir(mediaDirectory, { recursive: true })
  await db().$transaction(async (tx) => {
    const [profile, resume, projects, experiences, skills, media] = await Promise.all([
      tx.profile.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } }),
      tx.resume.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } }),
      tx.project.count(), tx.experience.count(), tx.skill.count(), tx.media.count()
    ])
    if (!profile || !resume || profile.version !== 1 || resume.version !== 1 || profile.status !== 'DRAFT' || resume.status !== 'DRAFT' || profile.name || profile.email || profile.linkedinUrl || profile.photoId || profile.translations.some(item => item.role || item.summary || item.photoAlt) || resume.translations.length || projects || experiences || skills || media) {
      throw new Error('Database tidak kosong; seed dibatalkan agar data yang ada tetap aman.')
    }

    async function addMedia(bytes: Uint8Array, kind: 'IMAGE' | 'PDF', mimeType: string) {
      const id = randomUUID()
      const path = resolve(mediaDirectory, id)
      await writeFile(path, bytes, { flag: 'wx', mode: 0o600 })
      createdFiles.push(path)
      await tx.media.create({ data: { id, objectKey: id, kind, mimeType, byteSize: bytes.length, state: 'READY' } })
      return id
    }

    const imagePaths = ['developer-anime-v2.png', 'project-urbanix.png', 'project-veloce.png', 'project-woodcraft.png']
    const images = []
    for (const name of imagePaths) images.push(await addMedia(await readFile(resolve('app/assets/image', name)), 'IMAGE', 'image/png'))
    const translations = [
      { locale: 'id', role: 'Web Developer — Contoh', summary: 'Ini adalah profil contoh untuk pratinjau. Ganti dengan profil dan pengalaman Anda sendiri.', photoAlt: 'Ilustrasi karakter developer contoh' },
      { locale: 'en', role: 'Web Developer — Sample', summary: 'This is a sample profile for preview. Replace it with your own profile and experience.', photoAlt: 'Sample developer character illustration' }
    ]
    await tx.profile.update({ where: { id: profile.id }, data: { name: 'Web Developer (Contoh)', email: 'hello@example.com', linkedinUrl: 'https://www.linkedin.com/', photoId: images[0], status: 'PUBLISHED', version: { increment: 1 }, translations: { deleteMany: {}, create: translations } } })
    const titles = ['Urbanix', 'Veloce', 'Woodcraft']
    for (const [index, title] of titles.entries()) {
      await tx.project.create({ data: {
        slug: `contoh-${title.toLowerCase()}`, featured: true, position: index, status: 'PUBLISHED', firstPublishedAt: new Date(), technologies: ['Nuxt.js', 'Vue.js', 'Tailwind CSS'],
        translations: { create: [
          { locale: 'id', title: `${title} — Contoh`, summary: 'Proyek contoh untuk pratinjau tampilan portfolio.', role: 'Web Developer (contoh)', outcome: 'Contoh studi kasus; ganti dengan hasil proyek Anda.' },
          { locale: 'en', title: `${title} — Sample`, summary: 'A sample project for previewing the portfolio.', role: 'Web Developer (sample)', outcome: 'Sample case study; replace with your own project outcome.' }
        ] },
        images: { create: [{ mediaId: images[index + 1]!, position: 0, altId: `Tampilan proyek contoh ${title}`, altEn: `Sample ${title} project preview` }] }
      } })
    }
    await tx.experience.create({ data: { company: 'Perusahaan Contoh / Sample Company', startDate: new Date('2023-01-01T00:00:00Z'), position: 0, status: 'PUBLISHED', translations: { create: [
      { locale: 'id', role: 'Web Developer (Contoh)', description: 'Pengalaman contoh untuk pratinjau. Ganti dengan riwayat Anda.' },
      { locale: 'en', role: 'Web Developer (Sample)', description: 'Sample experience for preview. Replace with your own history.' }
    ] } } })
    for (const { translations, ...experience } of demoExperiences) {
      await tx.experience.create({ data: { ...experience, status: 'PUBLISHED', translations: { create: translations } } })
    }
    for (const [position, name] of ['Nuxt.js', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Git'].entries()) await tx.skill.create({ data: { name, position } })
    const cv = []
    for (const locale of ['id', 'en'] as const) {
      const pdf = await PDFDocument.create()
      const page = pdf.addPage()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      page.drawText(locale === 'id' ? 'CV CONTOH - Ganti dengan CV Anda' : 'SAMPLE CV - Replace with your own CV', { x: 50, y: 750, size: 16, font })
      cv.push({ locale, mediaId: await addMedia(await pdf.save(), 'PDF', 'application/pdf') })
    }
    await tx.resume.update({ where: { id: resume.id }, data: { status: 'PUBLISHED', version: { increment: 1 }, translations: { create: cv } } })
  }, { timeout: 60_000 })
  console.log('Data contoh bilingual berhasil ditambahkan ke database lokal.')
} catch (error) {
  await Promise.all(createdFiles.map(path => rm(path, { force: true })))
  throw error
} finally {
  await db().$disconnect()
}
