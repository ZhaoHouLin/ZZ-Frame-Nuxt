// 取目前的表格；還沒上傳過回 null
export default defineEventHandler(async (event) => {
  requireExcelFeature()
  await requireAuth(event)
  return await readTable()
})
