import { safeApi } from '../../utils/api'
import { createError, getQuery, getRouterParam, setHeader } from 'h3'
import { z } from 'zod'
import { localeSchema, listSchema } from '../../../shared/portfolio'
import { publicProfile, publicProjects, publicProject, publicExperiences, publicResume } from '../../utils/publicContent'
import { db } from '../../utils/db'

export default safeApi(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  const [resource, slug, extra] = (getRouterParam(event, 'path') ?? '').split('/')
  if (extra) throw createError({ statusCode: 404 })
  const query = getQuery(event)
  const locale = resource === 'skills' ? 'id' : localeSchema.parse(query.locale)
  const { locale: _, featured, ...list } = query
  const { page, pageSize } = listSchema.omit({ status: true }).parse(list)
  if (resource === 'projects' && slug) return { data: await publicProject(locale, z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100).parse(slug)) }
  if (slug) throw createError({ statusCode: 404 })
  if (resource === 'projects') return publicProjects(locale, page, pageSize, featured === undefined ? undefined : z.enum(['true', 'false']).parse(featured) === 'true')
  if (resource === 'experiences') return publicExperiences(locale, page, pageSize)
  if (resource === 'skills') {
    const [data, total] = await Promise.all([db().skill.findMany({ skip: (page - 1) * pageSize, take: pageSize, orderBy: [{ position: 'asc' }, { id: 'asc' }], select: { id: true, name: true, position: true } }), db().skill.count()])
    return { data, meta: { page, pageSize, total } }
  }
  const data = resource === 'profile' ? await publicProfile(locale) : resource === 'resume' ? await publicResume(locale) : null
  if (!data) throw createError({ statusCode: 404 })
  return { data }
})
