import ldap from 'ldapjs'
import { SignJWT } from 'jose'

const SESSION_HOURS = 2

/** 用使用者帳密對 LDAP 做 bind，成功 resolve，失敗 reject（帶 ldapjs 的 err） */
function ldapBind(url, userDN, password) {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({ url, connectTimeout: 5000, timeout: 5000 })
    // 沒接 error event 時，LDAP 連不上會變成 unhandled error 把整個 process 弄掛
    client.on('error', reject)
    client.bind(userDN, password, (err) => {
      client.unbind()
      err ? reject(err) : resolve()
    })
  })
}

export default defineEventHandler(async (event) => {
  if (!isAuthEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const { username, password } = (await readBody(event)) ?? {}
  if (!username || !password) {
    throw createError({ statusCode: 400, message: '請輸入帳號與密碼' })
  }

  const config = useRuntimeConfig()
  try {
    await ldapBind(config.ldapUrl, `${username}@${config.ldapDomain}`, password)
  } catch (err) {
    if (err?.name === 'InvalidCredentialsError') {
      throw createError({ statusCode: 401, message: '帳號或密碼錯誤' })
    }
    console.error('LDAP 連線失敗：', err)
    throw createError({ statusCode: 502, message: 'LDAP 伺服器無法連線' })
  }

  const token = await new SignJWT({ user: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(new TextEncoder().encode(config.jwtSecret))

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: getRequestHeader(event, 'x-forwarded-proto') === 'https',
    path: '/',
    maxAge: 60 * 60 * SESSION_HOURS,
    sameSite: 'lax',
  })

  return { success: true, user: username }
})
