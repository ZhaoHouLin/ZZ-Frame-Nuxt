import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

export const isExcelEnabled = () => useAppConfig().features.excel.enabled

/** excel 功能關閉時所有 /api/excel/* 一律 404 */
export function requireExcelFeature() {
  if (!isExcelEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}

// 目前只支援一張表，存成 uploadDir 下的 JSON：{ name, headers, rows }
const TABLE_FILE = 'excel-table.json'

const tablePath = () => path.resolve(useRuntimeConfig().uploadDir, TABLE_FILE)

export async function readTable() {
  try {
    return JSON.parse(await readFile(tablePath(), 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return null
    throw err
  }
}

export async function writeTable(table) {
  await mkdir(path.dirname(tablePath()), { recursive: true })
  await writeFile(tablePath(), JSON.stringify(table))
}

/** 驗證 client 送來的表格結構，只留字串格 */
export function normalizeTable(input) {
  const headers = Array.isArray(input?.headers) ? input.headers.map(String) : null
  const rows = Array.isArray(input?.rows) ? input.rows : null
  if (!headers?.length || !rows) {
    throw createError({ statusCode: 400, message: '表格格式不正確' })
  }
  return {
    name: String(input.name ?? 'table.xlsx'),
    headers,
    rows: rows.map((r) => headers.map((_, i) => String(r?.[i] ?? ''))),
  }
}
