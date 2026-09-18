import path from 'node:path'
import * as XLSX from 'xlsx'

// 數字字串轉回數字，匯出的 Excel 才不會整欄變文字格。
// 只轉「轉回字串後一模一樣」的，"0000"、"007" 這種前導零的 ID 保持文字。
const toCell = (s) => (s !== '' && String(Number(s)) === s ? Number(s) : s)

// 把目前的表格匯出成 .xlsx 下載
export default defineEventHandler(async (event) => {
  requireExcelFeature()
  await requireAuth(event)

  const table = await readTable()
  if (!table) {
    throw createError({ statusCode: 404, message: '還沒有表格' })
  }

  const sheet = XLSX.utils.aoa_to_sheet([table.headers, ...table.rows.map((r) => r.cells.map(toCell))])
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1')
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

  const name = path.basename(table.name, path.extname(table.name)) + '.xlsx'
  const encoded = encodeURIComponent(name)
  setHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  setHeader(event, 'Content-Disposition', `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`)
  return buffer
})
