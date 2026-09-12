# 設計決策記錄

2026-09-12 — 將 ZZ-Frame-Nuxt（Nuxt 3）與 ZZ_Frame_Nuxt4 合併為單一 Nuxt 4 模板時的決策。

**目標**：一個自己常用的 Nuxt 起手框架，常用功能都整合在一起，實際開專案時把不需要的關掉或刪掉即可。

---

## 分析摘要

### ZZ-Frame-Nuxt（Nuxt 3.20）

| # | 嚴重度 | 問題 |
|---|---|---|
| 1 | 🔴 | `server/api/downloadFile.js` 路徑穿越：`join(cwd,'public','downloads', body.unit)` 沒擋 `..`，實測 `{"unit":"../../package.json"}` 回 200 |
| 2 | 🔴 | `npm audit`：nuxt 3.20 → devtools critical RCE、nitro-server moderate、brace-expansion high |
| 3 | 🔴 | `Strict-Transport-Security`、`X-Content-Type-Options` 用 `<meta http-equiv>` 設定，瀏覽器會忽略；CSP 含 `'unsafe-inline'` |
| 4 | 🟠 | `readJson.js` / `readXLSX.js` 靠 cwd 相對路徑才跑得動，`Data/` 不會進 `.output` |
| 5 | 🟠 | `ecosystem.config.js` 的 `port: '3030'` 不是 pm2 欄位，實際跑在 3000 |
| 6 | 🟠 | favicon 指向不存在的 `zzlogo.ico` |
| 7 | 🟠 | `Menu.vue` 每次開 drawer 重複 `addEventListener` + 建 gsap timeline；`killTweensOf` 殺錯目標 |
| 8 | 🟠 | 錯誤頁放在 `pages/error.vue`，Nuxt 只認根目錄 `error.vue`，`clearError()` 沒有真錯誤可清 |
| 9 | 🟡 | `@pinia/nuxt` 的 `autoImports` 選項在 0.11 已不存在；`build.transpile` naive-ui 是 SSR 用的，`ssr:false` 下無意義 |
| 10 | 🟡 | `DotGothic16-Regular.ttf` 2 MB 未使用；16 個手刻 icon 只用 1 個；空殼 `composables/api.js`、`stores/counter.js` |
| 11 | 🟡 | `viewport: width=500` 固定寬度 |

### ZZ_Frame_Nuxt4（Nuxt 4.2）

12 個共用檔案有 10 個與 Nuxt 3 版 hash 完全相同，上面 1–11 全部原樣存在。新增部分：

| # | 嚴重度 | 問題 |
|---|---|---|
| 12 | 🔴 | `upload.post.js`：`path.join(uploadDir, file.originalFilename)` 檔名帶 `../` 可寫到任意位置 |
| 13 | 🔴 | `download.get.js`：`path.join(uploadDir, query.name)` 讀取穿越 |
| 14 | 🔴 | `files.get.js` 沒有 `verifyAuth`，未登入可列出所有檔案 |
| 15 | 🔴 | `me.get.js` 只檢查 cookie 存在、不驗 JWT，任意 cookie 值可通過前端 middleware |
| 16 | 🔴 | `JWT_SECRET` 預設空字串，未設 env 時 HS256 用空 key 簽，token 可偽造 |
| 17 | 🔴 | `login.post.js` ldapjs client 未接 `error` event，LDAP 連不上時 unhandled error 會讓 process crash |
| 18 | 🔴 | 公開 repo 含內網資訊：Harbor/k8s/NAS IP、SSH 帳號、AD 網域、個人 email |
| 19 | 🟠 | `auth.global.js` / `guest.js` 在 middleware 用 `useFetch`，結果被 payload cache 住，登出後 `/api/me` 仍回 `loggedIn:true`。FileManager 註解「用 `window.location.href` 才會回到 login」就是這個症狀 |
| 20 | 🟠 | `stores/` 在根目錄，Nuxt 4 srcDir 是 `app/`，Pinia 沒自動載入，才需要手寫相對路徑 import |
| 21 | 🟠 | `.output/` 59 個 build 產物被 commit 進 git |
| 22 | 🟠 | README 寫 secret 名 `zz_frame-dep-secret`（底線非法），yaml 已修為 `zz-frame-dep-secret` |
| 23 | 🟠 | UI 說「10 個檔案、每個 20MB」但 server 端 formidable 用預設值，直接打 API 可繞過 |
| 24 | 🟡 | `yaml/deployment/deployment.yaml` 與 `harbor-dep.yaml` 前 56 行重複 |
| 25 | 🟡 | Dockerfile `COPY . .` 無 `.dockerignore`；用 `npm install` 非 `npm ci`；node 20 |
| 26 | 🟡 | `.drone.yml` 的 `install-deps` step 是多餘的，docker plugin 會照 Dockerfile 再裝一次 |
| 27 | 🟡 | `index.vue` 殘留未用的 login 程式碼；`stores/auth.js` 沒人用 |

---

## 決策

### 第一輪

**Q1 — 「刪掉不需要的」要做到什麼程度？**
選項：A 功能按資料夾隔離 + config 開關 / B 只修 bug 不管耦合 / C Nuxt Layers
✅ **A**。C 對個人模板太重，B 沒解決目標。

**Q2 — 公開 repo 裡的內網資訊怎麼處理？**
選項：A 全部改 placeholder / B 留著
✅ **A**。模板裡不該有實際環境值。

**Q3 — Nuxt 3 版本要不要留退路？**
✅ 在 `011a3e3` 打 `nuxt3` tag 後再覆蓋。

**Q4 — `.output/` 要從 git 拿掉嗎？**
✅ 拿掉（`git rm -r --cached`）。Drone 流程不依賴它。

**Q5 — 舊的 `downloadFile` API 和 `Data/` 還要嗎？**
✅ `downloadFile` 刪（已被 `download.get.js` 取代且有穿越漏洞）。`readJson` / `readXLSX` 見 Q14。

**Q6 — 未使用的資產要清嗎？**
✅ 刪 `DotGothic16` 字型和手刻 icon（已有 `@vicons/tabler`）。空殼 composable / store 留著但改成最小可用範例。

**Q7 — Node / 容器版本**
✅ `node:22-slim`，加 `.dockerignore`，改 `npm ci`。

### 第二輪

**Q8 — 功能開關放哪裡、關掉後行為是什麼？**
選項：A `app.config.ts` build 時決定 / B `runtimeConfig.public` 靠 env 切換
✅ **A**：`app.config.ts` 的 `features: { auth, files }`。關掉 auth 時 middleware 放行、`/login` 導回 `/`、server 端 `verifyAuth` 也跳過（files API 變公開）。理由：要不要登入是寫 code 時就知道的事；靠 env 切換忘了設就整站無防護。

**Q9 — 目錄怎麼切才「刪一個功能就乾淨」？**
選項：A Nuxt 慣例目錄 + 檔案按功能分組 + README 刪除對照表 / B `app/features/*` + 自訂 auto-import 設定
✅ **A**。主要靠 Q8 的開關，刪檔案是次要手段。

**Q10 — 上傳限制要在 server 端強制嗎？**
✅ 強制。`formidable({ maxFileSize, maxFiles })`，數字放 `app.config.ts`，前端訊息讀同一處。

**Q11 — 上傳同名檔案怎麼處理？**
選項：覆蓋 / 409 拒絕 / 自動加流水號
✅ **維持覆蓋**，但檔名先 `path.basename` 消毒。不加新行為。

**Q12 — git history 裡的內網 IP / email 要清嗎？**
✅ **不清**。已公開的資訊收不回來，force push 公開 repo 代價大於收益。

**Q13 — 成品怎麼交到 ZZ-Frame-Nuxt？**
選項：A `nuxt4` 分支，本人 review 後 merge + push / B 直接 commit main / C 代為 push
✅ **A**。

**Q14 — `readJson` / `readXLSX` 留不留？**
✅ **留**，改用 `server/assets/` + `useStorage('assets:server')`，build 後仍可讀。`example.xlsx` 裡的 email 換掉。

**Q15 — pm2 的 `ecosystem.config.js` 還要嗎？**
✅ **留但修好**：`env: { PORT }`、加 `cwd`。

---

## 實作時與決策的出入

- **CSP 的 `script-src` 保留 `'unsafe-inline'`**：實測 Nuxt 4 SPA 會輸出 inline `<script>` 和 `<script type="importmap">`，拿掉會整個 app 起不來。沒有 nuxt-security 模組就沒有 nonce 機制。其餘 header 已改為真正的 HTTP header（`routeRules`）。
- **`app.config.ts` 在 `app/` 下**：放根目錄 Nitro 端的 `useAppConfig()` 看不到，啟動即 crash。
- **路徑穿越是「中和」不是「拒絕」**：`resolveInside` 先取 `basename`，所以 `../../package.json` 變成找 `uploads/package.json` → 404，而不是 400。只有 `.`、`..`、空字串會 400。實測上傳 `../../evil.txt` 落在 uploadDir 內。
- **`composables/api.js` 沒有保留**：Q6 說空殼改成最小範例，但 `useApi` 沒有明確用途，改成實際被用到的 `useFeatures`。
- **順手修了 yaml 的 label 不一致**：`deployment.yaml` 是 `app: zz-frame-nuxt4`，`svc*.yaml` selector 是 `app: zz-frame-test`，Service 選不到 Pod。統一為 `zz-frame`。
- **login 不再擋「已有 cookie」**：原本已登入（含過期 token）就拒絕再登入，會導致 token 過期後要先登出才能登入。改為登入直接覆蓋 cookie。
- **登出按鈕從 FileManager 移到 Menu**：FileManager 不該知道 auth 的存在，否則 auth 關閉時要動它。
- **錯誤訊息改用 `message`**：h3 對長 `statusMessage` 發 warning，前端改讀 `err.data.message`。

## 驗證紀錄（2026-09-12）

- `nuxt build` 通過，`npm audit` 0 vulnerabilities（nuxt 4.5.2）
- 無環境變數啟動 → 啟動失敗並列出缺少的變數 ✅
- `/api/auth/me` 無 cookie / 假 cookie → 401；有效 JWT → 200 ✅
- `/api/files` 未登入 → 401 ✅
- `download?name=../../package.json` → 404，內容不外洩 ✅
- 上傳 `../../evil.txt` → 落在 uploadDir ✅；上傳 21MB → 413 ✅
- LDAP 連不上 → 502，process 沒掛 ✅
- `readJson` / `readXLSX` 從 `server/assets` 讀取 → 200 ✅
- auth + files 關閉：無 env 可啟動、`/api/auth/me` 200、`/api/files/*` 404 ✅
- headless Edge 實際渲染：`/`（counter store）、`/files`（限制文字讀自 app.config）、`/login`（auth 關閉時導回首頁）、404 頁，無 console error ✅

## 未列入本次範圍

- Lint / formatter / 測試框架（未要求）
- Nuxt Layers
- 上傳檔名衝突的新行為
- git history 重寫
