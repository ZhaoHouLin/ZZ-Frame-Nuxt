// 功能開關：不需要的功能把 enabled 改成 false 即可，前後端會一起關閉。
// 要徹底移除某個功能，請參考 README「移除功能」對照表。
export default defineAppConfig({
  features: {
    // AD (LDAP) 登入。關閉後：全站不需登入、/login 導回首頁、server 端不再驗證 JWT。
    auth: { enabled: true },
    // 檔案上傳/下載。關閉後：/files 導回首頁、/api/files/* 回 404。
    // 注意：auth 關閉而 files 開啟時，檔案 API 是公開的。
    files: { enabled: true, maxSizeMB: 20, maxFiles: 10 },
    // Excel 上傳成表格、線上編輯、匯出。關閉後：/excel 導回首頁、/api/excel/* 回 404。
    // 表格存在 NUXT_UPLOAD_DIR 下的 excel-table.json；auth 關閉時同樣是公開的。
    excel: { enabled: true },
  },
})
