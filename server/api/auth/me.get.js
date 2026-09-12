// 回傳目前登入狀態。auth 關閉時視為已登入（user 為 null）。
export default defineEventHandler(async (event) => {
  const payload = await requireAuth(event)
  return { loggedIn: true, user: payload?.user ?? null }
})
