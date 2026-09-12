export const useAuthStore = defineStore('auth', () => {
  const loggedIn = ref(false)
  const user = ref(null)

  // 向 server 確認 cookie 是否有效。用 $fetch 不用 useFetch：
  // useFetch 的結果會被 payload 快取，登出後仍會拿到舊的 loggedIn:true。
  const check = async () => {
    try {
      const data = await $fetch('/api/auth/me')
      loggedIn.value = data.loggedIn
      user.value = data.user
    } catch {
      loggedIn.value = false
      user.value = null
    }
    return loggedIn.value
  }

  const login = async (username, password) => {
    const data = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    loggedIn.value = true
    user.value = data.user
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    loggedIn.value = false
    user.value = null
    await navigateTo('/login')
  }

  return { loggedIn, user, check, login, logout }
})
