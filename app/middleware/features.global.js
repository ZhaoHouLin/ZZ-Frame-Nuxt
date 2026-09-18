// 功能關閉時，該功能的頁面導回首頁
const FEATURE_ROUTES = {
  '/login': 'auth',
  '/files': 'files',
  '/excel': 'excel',
}

export default defineNuxtRouteMiddleware((to) => {
  const feature = FEATURE_ROUTES[to.path]
  if (feature && !useFeatures()[feature].enabled) {
    return navigateTo('/')
  }
})
