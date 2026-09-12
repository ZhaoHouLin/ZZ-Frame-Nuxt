import * as XLSX from 'xlsx'

// 範例：讀取 server/assets/ 下的 Excel，第一個工作表轉成 JSON。
export default defineEventHandler(async () => {
  const buffer = await useStorage('assets:server').getItemRaw('example.xlsx')
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(sheet)
})
