// 儲存編輯：body = { base: 載入時的列, rows: 改完的列 }，只套用兩者的差異並寫修改紀錄
export default defineEventHandler(async (event) => {
  requireExcelFeature()
  await requireAuth(event)

  const stored = await readTable()
  if (!stored) {
    throw createError({ statusCode: 404, message: '還沒有表格，請先匯入' })
  }
  const body = await readBody(event)
  const base = normalizeRows(stored.headers, body?.base)
  const current = normalizeRows(stored.headers, body?.rows)
  const { table, entries } = mergeTable(stored, base, current)
  await writeTable(table)
  return { ...table, applied: entries.length }
})
