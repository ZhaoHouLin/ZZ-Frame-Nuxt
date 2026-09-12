// 啟動時檢查必要環境變數，缺少就直接讓 server 起不來，
// 避免 JWT_SECRET 為空字串時 token 任何人都能偽造。
export default defineNitroPlugin(() => {
  if (!useAppConfig().features.auth.enabled) return

  const config = useRuntimeConfig()
  const missing = [
    ['jwtSecret', 'NUXT_JWT_SECRET'],
    ['ldapUrl', 'NUXT_LDAP_URL'],
    ['ldapDomain', 'NUXT_LDAP_DOMAIN'],
  ]
    .filter(([key]) => !config[key])
    .map(([, env]) => env)

  if (missing.length) {
    throw new Error(
      `features.auth 已開啟但缺少環境變數：${missing.join(', ')}（或在 app.config.ts 關閉 auth）`
    )
  }
})
