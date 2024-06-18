// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "node:path"
export default defineNuxtConfig({
  devtools: { enabled: false },
  ssr: false,
  // 其他配置
  vite: {
    css: {
      preprocessorOptions: {
        stylus: {
          additionalData: `@import "${path.resolve(
            __dirname,
            "./assets/style.styl"
          )}"`,
        },
      },
    },
  },
  build: {
    transpile:
      process.env.NODE_ENV === "production"
        ? [
            "naive-ui",
            "vueuc",
            "@css-render/vue3-ssr",
            "@juggle/resize-observer",
          ]
        : ["@juggle/resize-observer"],
  },
  app: {
    head: {
      viewport: "width=500, initial-scale=1",
      title: "ZZ-Frame",
      meta: [
        {
          "http-equiv": "Content-Security-Policy",
          content:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; frame-src 'none';",
        },

        {
          "http-equiv": "Strict-Transport-Security",
          content: "max-age=31536000; includeSubDomains; preload",
        },
        {
          "http-equiv": "X-Content-Type-Options",
          content: "nosniff",
        },
        {
          "http-equiv": "Referrer-Policy",
          content: "no-referrer",
        },
        {
          name: "description",
          content: "ZZ-Frame",
        },
        { property: "og:title", content: "ZZ-Frame" },
        { property: "og:url", content: "" },
        {
          property: "og:description",
          content: "ZZ-Frame",
        },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "zzlogo.ico" }],
    },
    // layoutTransition: { name: "layout", mode: "out-in" },
    pageTransition: { name: "page", mode: "out-in" },
  },
  modules: [
    [
      "@pinia/nuxt",
      {
        autoImports: ["defineStore", "acceptHMRUpdate"],
      },
    ],
  ],
})
