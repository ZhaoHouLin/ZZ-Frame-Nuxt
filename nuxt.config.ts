// https://nuxt.com/docs/4.x/api/nuxt-config
import { fileURLToPath } from "node:url"

const styleEntry = fileURLToPath(
  new URL("./app/assets/style.styl", import.meta.url)
).replace(/\\/g, "/")

const csp = [
  "default-src 'self'",
  // Nuxt 會輸出 inline <script> 與 <script type="importmap">，拿掉 'unsafe-inline' 整個 app 會起不來
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'", // naive-ui 以 css-render 動態注入 <style>
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
].join("; ")

export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  vite: {
    css: {
      preprocessorOptions: {
        stylus: {
          additionalData: `@import "${styleEntry}"`,
        },
      },
    },
  },
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",
      title: "ZZ-Frame",
      meta: [
        { name: "description", content: "ZZ-Frame" },
        { property: "og:title", content: "ZZ-Frame" },
        { property: "og:description", content: "ZZ-Frame" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
    pageTransition: { name: "page", mode: "out-in" },
  },
  // 安全 header 必須是真正的 HTTP header，用 <meta http-equiv> 設定瀏覽器會忽略
  routeRules: {
    "/**": {
      headers: {
        "Content-Security-Policy": csp,
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "X-Frame-Options": "DENY",
        // 只在 HTTPS 下生效，HTTP 回應會被瀏覽器忽略
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      },
    },
  },
  modules: ["@pinia/nuxt"],
  // 對應環境變數：NUXT_JWT_SECRET、NUXT_LDAP_URL、NUXT_LDAP_DOMAIN、NUXT_UPLOAD_DIR
  runtimeConfig: {
    jwtSecret: "",
    ldapUrl: "",
    ldapDomain: "",
    uploadDir: "uploads",
    public: {},
  },
})
