export default defineNuxtRouteMiddleware(async () => {
  try {
    await useRequestFetch()('/api/admin/session')
  } catch {
    return navigateTo('/admin/login')
  }
})
