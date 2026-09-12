import { createReadStream } from 'node:fs'
import { access } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  requireFilesFeature()
  await requireAuth(event)

  const { uploadDir } = useRuntimeConfig()
  const filePath = resolveInside(uploadDir, getQuery(event).name)

  try {
    await access(filePath)
  } catch {
    throw createError({ statusCode: 404, message: '檔案不存在' })
  }

  // filename* 讓瀏覽器用 UTF-8 解讀中文檔名
  const encoded = encodeURIComponent(path.basename(filePath))
  setHeader(
    event,
    'Content-Disposition',
    `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`
  )
  return sendStream(event, createReadStream(filePath))
})
