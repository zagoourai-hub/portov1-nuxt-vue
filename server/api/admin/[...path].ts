import { safeApi } from '../../utils/api'
import { createError, getQuery, getRouterParam, setResponseStatus } from 'h3'
import { z } from 'zod'
import { profileSchema, projectSchema, experienceSchema, skillSchema, resumeSchema, versionSchema, listSchema, idSchema } from '../../../shared/portfolio'
import { db } from '../../utils/db'
import { requireOwner, parseBody } from '../../utils/http'
import { deleteContent, saveProfile, saveProject, saveExperience, saveResume, publishContent, conflict } from '../../utils/content'
import type { ContentResource } from '../../utils/content'
import { deleteMedia, uploadMedia, streamMedia } from '../../utils/media'

export default safeApi(async (event) => {
  const owner = await requireOwner(event)
  const parts = (getRouterParam(event, 'path') ?? '').split('/').filter(Boolean)
  const resource = z.enum(['profile', 'projects', 'experiences', 'skills', 'resume', 'media', 'overview', 'session']).parse(parts[0])
  const singleton = resource === 'profile' || resource === 'resume'
  const id = !singleton && parts[1] ? idSchema.parse(parts[1]) : undefined
  const action = parts[singleton ? 1 : 2]
  if (parts.length > (singleton ? 2 : 3)) throw createError({ statusCode: 404 })

  if (event.method === 'POST' && (action === 'publish' || action === 'unpublish') && ['profile', 'projects', 'experiences', 'resume'].includes(resource)) {
    const { version } = await parseBody(event, versionSchema)
    return { data: await publishContent(resource as ContentResource, id, version, action === 'publish') }
  }
  if (resource === 'media') {
    if (event.method === 'POST' && !id) return { data: await uploadMedia(event) }
    if (event.method === 'GET' && id && action === 'file') return streamMedia(event, id, true)
    if (event.method === 'DELETE' && id && !action) {
      await deleteMedia(id)
      setResponseStatus(event, 204)
      return null
    }
  }
  if (action) throw createError({ statusCode: 404 })

  if (event.method === 'GET') {
    if (resource === 'session') return { data: { id: owner.id, name: owner.name } }
    if (resource === 'overview') {
      const [projects, drafts, experiences, skills, media] = await Promise.all([
        db().project.count(), db().project.count({ where: { status: 'DRAFT' } }), db().experience.count(), db().skill.count(), db().media.count()
      ])
      return { data: { projects, drafts, experiences, skills, media } }
    }
    if (resource === 'profile') return { data: await db().profile.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } }) }
    if (resource === 'resume') return { data: await db().resume.findUnique({ where: { singletonKey: 'main' }, include: { translations: true } }) }
    if (id && resource === 'projects') return { data: await db().project.findUniqueOrThrow({ where: { id }, include: { translations: true, images: { orderBy: { position: 'asc' } } } }) }
    if (id && resource === 'experiences') return { data: await db().experience.findUniqueOrThrow({ where: { id }, include: { translations: true } }) }
    if (id) throw createError({ statusCode: 404 })
    const { page, pageSize, status } = listSchema.parse(getQuery(event))
    const paging = { skip: (page - 1) * pageSize, take: pageSize }
    const orderBy = [{ position: 'asc' as const }, { id: 'asc' as const }]
    const where = status ? { status } : {}
    let data, total
    if (resource === 'projects') [data, total] = await Promise.all([db().project.findMany({ ...paging, where, orderBy, include: { translations: true, images: true } }), db().project.count({ where })])
    else if (resource === 'experiences') [data, total] = await Promise.all([db().experience.findMany({ ...paging, where, orderBy, include: { translations: true } }), db().experience.count({ where })])
    else if (resource === 'skills') [data, total] = await Promise.all([db().skill.findMany({ ...paging, orderBy }), db().skill.count()])
    else [data, total] = await Promise.all([db().media.findMany({ ...paging, orderBy: { createdAt: 'desc' }, select: { id: true, kind: true, mimeType: true, byteSize: true, state: true, createdAt: true, _count: { select: { images: true, profiles: true, resumes: true } } } }), db().media.count()])
    return { data, meta: { page, pageSize, total } }
  }

  if (event.method === 'PUT' && resource === 'profile') return { data: await saveProfile(await parseBody(event, profileSchema)) }
  if (event.method === 'PUT' && resource === 'resume') return { data: await saveResume(await parseBody(event, resumeSchema)) }
  if (['POST', 'PUT'].includes(event.method) && ['projects', 'experiences', 'skills'].includes(resource)) {
    if ((event.method === 'PUT') !== Boolean(id)) throw createError({ statusCode: 405 })
    if (event.method === 'POST') setResponseStatus(event, 201)
    if (resource === 'projects') {
      if (!id) return { data: await saveProject(await parseBody(event, projectSchema)) }
      const { version, ...input } = await parseBody(event, projectSchema.extend(versionSchema.shape))
      return { data: await saveProject(input, id, version) }
    }
    if (resource === 'experiences') {
      if (!id) return { data: await saveExperience(await parseBody(event, experienceSchema)) }
      const { version, ...input } = await parseBody(event, experienceSchema.safeExtend(versionSchema.shape))
      return { data: await saveExperience(input, id, version) }
    }
    if (!id) return { data: await db().skill.create({ data: await parseBody(event, skillSchema) }) }
    const { version, ...input } = await parseBody(event, skillSchema.extend(versionSchema.shape))
    const result = await db().skill.updateMany({ where: { id, version }, data: { ...input, version: { increment: 1 } } })
    if (!result.count) throw conflict()
    return { data: await db().skill.findUnique({ where: { id } }) }
  }
  if (event.method === 'DELETE' && id && (resource === 'projects' || resource === 'experiences' || resource === 'skills')) {
    const { version } = await parseBody(event, versionSchema)
    await deleteContent(resource, id, version)
    setResponseStatus(event, 204)
    return null
  }
  throw createError({ statusCode: 405, message: 'Metode tidak tersedia' })
})
