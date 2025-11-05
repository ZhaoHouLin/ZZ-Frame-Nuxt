export const apps = [
  {
    name: 'ZZ-Frame',
    exec_mode: 'cluster',
    // instances: 'max',
    port: '3030',
    // host: '192.168.68.71'
    script: './.output/server/index.mjs',
    // env_production: {
    //   // 環境參數,當前指定為生產環境
    //   NODE_ENV: "production", //使用production模式 pm2 start ecosystem.config.js --env production
    //   PORT: "6001",
    // }
  }
]