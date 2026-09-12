import path from 'node:path'

export const isFilesEnabled = () => useAppConfig().features.files.enabled

/** files 功能關閉時所有 /api/files/* 一律 404 */
export function requireFilesFeature() {
  if (!isFilesEnabled()) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
}

/**
 * 把使用者給的檔名限制在 dir 之內，擋掉 ../ 之類的路徑穿越。
 * 回傳絕對路徑；不合法時丟 400。
 */
export function resolveInside(dir, name) {
  const base = path.basename(String(name ?? ''))
  if (!base || base === '.' || base === '..') {
    throw createError({ statusCode: 400, message: '檔名不合法' })
  }
  const root = path.resolve(dir)
  const target = path.resolve(root, base)
  if (!target.startsWith(root + path.sep)) {
    throw createError({ statusCode: 400, message: '檔名不合法' })
  }
  return target
}
