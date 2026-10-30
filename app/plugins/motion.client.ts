import { startScrollMotion } from '~/utils/scrollMotion'

export default defineNuxtPlugin((nuxtApp) => {
  let stop = () => {}

  function refresh() {
    stop()
    stop = startScrollMotion()
  }

  nuxtApp.hook('app:mounted', refresh)
  nuxtApp.hook('page:finish', refresh)
  nuxtApp.vueApp.onUnmount(() => stop())
})
