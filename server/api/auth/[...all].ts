import { safeApi } from '../../utils/api'
import { toWebRequest, getRequestIP } from 'h3'
import { auth } from '../../utils/auth'

export default safeApi((event) => {
  const request = toWebRequest(event)
  request.headers.set('x-portfolio-client-ip', getRequestIP(event, { xForwardedFor: false }) ?? 'unknown')
  return auth().handler(request)
})
