import formidable from 'formidable'
import { readFile, unlink } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import * as XLSX from 'xlsx'

const ALLOWED = new Set(['.xlsx', '.xls', '.csv'])

// 每格轉成字串：日期用 Excel 顯示文字，其他數字取原值（不用顯示格式，避免 1.7E+12 這種精度損失）
const cellToString = (cell) => {
  if (!cell || cell.v == null) return ''
  if (cell.t === 'n' && !XLSX.SSF.is_date(cell.z ?? '')) return String(cell.v)
  return cell.w ?? String(cell.v)
}

const sheetToStrings = (sheet) => {
  if (!sheet['!ref']) return []
  const range = XLSX.utils.decode_range(sheet['!ref'])
  const rows = []
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row = []
    for (let c = range.s.c; c <= range.e.c; c++) {
      row.push(cellToString(sheet[XLSX.utils.encode_cell({ r, c })]))
    }
    rows.push(row)
  }
  return rows
}

// 上傳一個 Excel，第一個工作表轉成表格存起來（覆蓋前一張）
export default defineEventHandler(async (event) => {
  requireExcelFeature()
  await requireAuth(event)

  const form = formidable({
    uploadDir: os.tmpdir(),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 20 * 1024 * 1024,
  })

  let files
  try {
    ;[, files] = await form.parse(event.node.req)
  } catch (err) {
    throw createError({ statusCode: err.httpCode ?? 400, message: '上傳失敗：一次一個檔案、不超過 20MB' })
  }

  const file = Object.values(files).flat()[0]
  if (!file?.originalFilename) {
    throw createError({ statusCode: 400, message: '沒有收到檔案' })
  }

  try {
    const ext = path.extname(file.originalFilename).toLowerCase()
    if (!ALLOWED.has(ext)) {
      throw createError({ statusCode: 400, message: '只接受 .xlsx / .xls / .csv' })
    }

    // xlsx 的 ESM 版沒有 fs，不能用 readFile，先讀成 buffer
    const workbook = XLSX.read(await readFile(file.filepath), { type: 'buffer', cellNF: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const [headers = [], ...rows] = sheetToStrings(sheet)
    if (!headers.length) {
      throw createError({ statusCode: 400, message: '第一個工作表是空的' })
    }

    const table = normalizeTable({ name: path.basename(file.originalFilename), headers, rows })
    await writeTable(table)
    return table
  } finally {
    await unlink(file.filepath).catch(() => {})
  }
})
