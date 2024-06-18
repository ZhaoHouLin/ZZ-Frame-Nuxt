import { createReadStream } from 'fs'
import { promises as fs } from 'fs'
import { join } from 'path'


export default defineEventHandler(async (event) => {

  try {
    const body = await readBody(event)
    const fileName = body.unit // 使用 DOMPurify 消毒輸入
    if (!fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'File name is required',
      })
    }

    const filePath = join(process.cwd(), 'public', 'downloads', fileName)

    // 檢查文件是否存在
    await fs.access(filePath)

    // 讀取文件內容並傳輸
    return sendStream(event, createReadStream(filePath), {
      headers: {
        // 'Content-Disposition': 'attachment; filename=your-file.exe',
        // 'Content-Type': 'application/octet-stream'
        'Content-Disposition': 'attachment; filename=printerInstall.bat',
        'Content-Type': 'text/plain'
      }
    })
  } catch (error) {
    console.error('File read error:', error)

    if (error.code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found',
        message: 'File not found',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: 'An unexpected error occurred',
    })
  }
})