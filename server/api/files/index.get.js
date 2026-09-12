import { readdir } from 'node:fs/promises'

export default defineEventHandler(async (event) => {
  requireFilesFeature()
  await requireAuth(event)

  const { uploadDir } = useRuntimeConfig()
  try {
    const entries = await readdir(uploadDir, { withFileTypes: true })
    return entries.filter((e) => e.isFile()).map((e) => e.name)
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
})
