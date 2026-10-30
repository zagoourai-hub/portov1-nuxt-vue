import { safeApi } from '../../utils/api'
import { createError, getRouterParam } from 'h3'
import { idSchema } from '../../../shared/portfolio'
import { streamMedia } from '../../utils/media'

export default safeApi((event) => {
  if (!['GET', 'HEAD'].includes(event.method)) throw createError({ statusCode: 405 })
  return streamMedia(event, idSchema.parse(getRouterParam(event, 'id')))
})
