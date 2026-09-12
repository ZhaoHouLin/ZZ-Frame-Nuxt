// 全站登入保護。features.auth 關閉時整個略過。
export default defineNuxtRouteMiddleware(async (to) => {
  if (!useFeatures().auth.enabled) return
  if (to.path === '/login') return

  const auth = useAuthStore()
  if (!(await auth.check())) {
    return navigateTo('/login')
  }
})
