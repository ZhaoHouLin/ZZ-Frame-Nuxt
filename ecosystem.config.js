// pm2 設定：pm2 start ecosystem.config.js
// 環境變數（NUXT_JWT_SECRET 等）請放在 .env 或 env 區塊
export const apps = [
  {
    name: 'ZZ-Frame',
    script: './.output/server/index.mjs',
    // 固定工作目錄，uploads 等相對路徑才不會隨啟動位置改變
    cwd: import.meta.dirname,
    exec_mode: 'cluster',
    // instances: 'max',
    // Nitro 讀的是 PORT 環境變數，不是 pm2 的 port 欄位
    env: {
      PORT: 3030,
    },
  },
]
