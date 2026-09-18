// 儲存編輯後的表格
export default defineEventHandler(async (event) => {
  requireExcelFeature()
  await requireAuth(event)
  const table = normalizeTable(await readBody(event))
  await writeTable(table)
  return table
})
