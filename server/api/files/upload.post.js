import formidable from 'formidable'
import { mkdir, rename } from 'node:fs/promises'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  requireFilesFeature()
  await requireAuth(event)

  const { uploadDir } = useRuntimeConfig()
  const { maxSizeMB, maxFiles } = useAppConfig().features.files
  await mkdir(uploadDir, { recursive: true })

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
    maxFileSize: maxSizeMB * 1024 * 1024,
    maxFiles,
  })

  let files
  try {
    ;[, files] = await form.parse(event.node.req)
  } catch (err) {
    // formidable 超過限制時的錯誤帶 httpCode 413
    throw createError({
      statusCode: err.httpCode ?? 400,
      message: `上傳失敗：最多 ${maxFiles} 個檔案、每個不超過 ${maxSizeMB}MB`,
    })
  }

  const uploaded = []
  for (const file of Object.values(files).flat()) {
    if (!file?.originalFilename) continue
    // 同名檔案直接覆蓋
    const target = resolveInside(uploadDir, file.originalFilename)
    await rename(file.filepath, target)
    const name = path.basename(target)
    uploaded.push({
      name,
      url: `/api/files/download?name=${encodeURIComponent(name)}`,
    })
  }

  return { success: true, uploaded }
})
