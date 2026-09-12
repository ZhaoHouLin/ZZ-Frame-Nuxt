// 已登入者不需再看登入頁
export default defineNuxtRouteMiddleware(async () => {
  if (await useAuthStore().check()) {
    return navigateTo('/')
  }
})
