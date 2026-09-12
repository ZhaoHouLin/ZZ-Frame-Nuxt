import { jwtVerify } from 'jose'

export const SESSION_COOKIE = 'ad_session'

export const isAuthEnabled = () => useAppConfig().features.auth.enabled

/**
 * 驗證 JWT cookie。auth 功能關閉時直接放行並回傳 null。
 * 通過時回傳 { user } payload。
 */
export async function requireAuth(event) {
  if (!isAuthEnabled()) return null

  const token = getCookie(event, SESSION_COOKIE)
  if (!token) {
    throw createError({ statusCode: 401, message: '未登入' })
  }

  const config = useRuntimeConfig()
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(config.jwtSecret)
    )
    return payload
  } catch {
    throw createError({ statusCode: 401, message: 'JWT 無效或過期' })
  }
}
