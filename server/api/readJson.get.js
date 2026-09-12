// 範例：讀取 server/assets/ 下的 JSON。
// server/assets 會被打包進 .output，不依賴執行時的 cwd。
export default defineEventHandler(async () => {
  return await useStorage('assets:server').getItem('example.json')
})
