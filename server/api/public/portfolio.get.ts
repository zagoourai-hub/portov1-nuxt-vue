import { getQuery } from 'h3'
import { localeSchema } from '../../../shared/portfolio'
import { safeApi } from '../../utils/api'
import { publicProfile, publicProjects, publicExperiences, publicResume } from '../../utils/publicContent'
import { db } from '../../utils/db'

export default safeApi(async (event) => {
  const locale = localeSchema.parse(getQuery(event).locale)
  const [profile, projects, experiences, skills, resume] = await Promise.all([
    publicProfile(locale), publicProjects(locale, 1, 6, true), publicExperiences(locale, 1, 100),
    db().skill.findMany({ orderBy: [{ position: 'asc' }, { id: 'asc' }], select: { id: true, name: true, position: true } }), publicResume(locale)
  ])
  return { data: { profile, projects, experiences, skills, resume } }
})
