
import * as fs from 'node:fs'
import * as XLSX from 'xlsx'
XLSX.set_fs(fs)

export default defineEventHandler(async (event) => {

  const XLSXfilePath = 'Data/example.xlsx'

  // 讀取 XLSX 檔案
  const workbook = XLSX.readFile(XLSXfilePath)
  // 獲取工作表的名稱
  const sheetName = workbook.SheetNames[0]
  // 獲取工作表的資料
  const worksheet = workbook.Sheets[sheetName]
  // 將工作表轉換為 JSON 格式
  const jsonData = XLSX.utils.sheet_to_json(worksheet)
  // 輸出 JSON 資料
  return jsonData
})


