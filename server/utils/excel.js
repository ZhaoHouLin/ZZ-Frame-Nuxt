import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import path from 'node:path'

export const isExcelEnabled = () => useAppConfig().features.excel.enabled

/** excel 功能關閉時所有 /api/excel/* 一律 404 */
export function requireExcelFeature() {
  if (!isExcelEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}

// 目前只支援一張表，存成 uploadDir 下的 JSON：
// { name, headers, rows: [{ id, cells }], log: [{ at, kind, rowKey, col, from, to }] }
const TABLE_FILE = 'excel-table.json'
const LOG_LIMIT = 200

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

const toCells = (headers, r) => headers.map((_, i) => String(r?.[i] ?? ''))

/** 上傳時用：二維陣列變成有 id 的列 */
export function newTable(name, headers, rawRows) {
  const h = headers.map(String)
  return {
    name: String(name),
    headers: h,
    rows: rawRows.map((r) => ({ id: randomUUID(), cells: toCells(h, r) })),
    log: [],
  }
}

/** 驗證 client 送來的列陣列，只留 { id, cells } */
export function normalizeRows(headers, input) {
  if (!Array.isArray(input)) {
    throw createError({ statusCode: 400, message: '表格格式不正確' })
  }
  return input.map((r) => ({
    id: typeof r?.id === 'string' && r.id ? r.id : randomUUID(),
    cells: toCells(headers, r?.cells),
  }))
}

/**
 * 把 client 的修改（base → current 的差異）套到目前存的表上。
 * 只動 client 真的改過的格子，別人同時改的其他列不會被蓋掉。
 * 回傳 { table, entries }。
 */
export function mergeTable(stored, base, current) {
  const at = new Date().toISOString()
  const entries = []
  const baseById = new Map(base.map((r) => [r.id, r]))
  const storedById = new Map(stored.rows.map((r) => [r.id, r]))
  const { headers } = stored

  for (const row of current) {
    const before = baseById.get(row.id)
    if (!before) {
      // 新增的列
      if (!storedById.has(row.id)) {
        stored.rows.push(row)
        storedById.set(row.id, row)
        entries.push({ at, kind: 'add', rowKey: row.cells[0] })
      }
      continue
    }
    const target = storedById.get(row.id)
    if (!target) continue // 別人已刪掉這列，放棄這列的修改
    row.cells.forEach((v, i) => {
      if (v === before.cells[i]) return
      const from = target.cells[i]
      target.cells[i] = v
      entries.push({ at, kind: 'edit', rowKey: target.cells[0], col: headers[i], from, to: v })
    })
  }

  const currentIds = new Set(current.map((r) => r.id))
  for (const before of base) {
    if (currentIds.has(before.id) || !storedById.has(before.id)) continue
    stored.rows = stored.rows.filter((r) => r.id !== before.id)
    entries.push({ at, kind: 'delete', rowKey: before.cells[0] })
  }

  stored.log = [...entries.reverse(), ...(stored.log ?? [])].slice(0, LOG_LIMIT)
  return { table: stored, entries }
}
