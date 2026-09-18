# ZZ-Frame-Nuxt

自己常用的 Nuxt 4 起手框架。常用功能都整合在一起，開新專案時把不需要的關掉或刪掉即可。

- Nuxt 4（SPA 模式，`ssr: false`）+ Pinia
- naive-ui + pug + stylus + gsap
- AD (LDAP) 登入，JWT cookie session
- 檔案上傳 / 下載
- Excel 上傳成表格、線上編輯、匯出
- 讀取 JSON / Excel 範例
- Docker / Drone CI / k8s 部署腳本
- pm2 設定

Nuxt 3 版本保留在 git tag `nuxt3`。

## 開始

```bash
cp .env.example .env   # 填入實際值
npm install
npm run dev
```

## 功能開關

`app/app.config.ts`：

```ts
features: {
  auth:  { enabled: true },
  files: { enabled: true, maxSizeMB: 20, maxFiles: 10 },
  excel: { enabled: true },
}
```

| 開關 | 關閉後 |
|---|---|
| `auth` | 全站不需登入；`/login` 導回首頁；server 端不驗證 JWT；不需要 `NUXT_JWT_SECRET` / `NUXT_LDAP_*` |
| `files` | `/files` 導回首頁；`/api/files/*` 回 404；選單不顯示「檔案管理」 |
| `excel` | `/excel` 導回首頁；`/api/excel/*` 回 404；選單不顯示「Excel 表格」 |

注意：`auth` 關閉但 `files` 或 `excel` 開啟時，檔案與表格 API 是公開的。

`auth` 開啟時，缺少環境變數 server 會直接啟動失敗並告訴你缺哪個。

## 移除功能

開關關掉就夠用；要徹底刪除時對照下表：

| 功能 | 刪除這些 |
|---|---|
| auth | `server/api/auth/`、`server/utils/auth.js`、`server/plugins/check-config.js`、`app/middleware/auth.global.js`、`app/middleware/guest.js`、`app/pages/login.vue`、`app/stores/auth.js`；`package.json` 移除 `jose`、`ldapjs`；`server/api/files/*` 拿掉 `requireAuth`；`Menu.vue` 拿掉登出 |
| files | `server/api/files/`、`server/utils/files.js`、`app/pages/files.vue`、`app/components/FileManager.vue`；`package.json` 移除 `formidable`（excel 也用到，兩者都刪才移除）；`Menu.vue` 拿掉「檔案管理」 |
| excel | `server/api/excel/`、`server/utils/excel.js`、`app/pages/excel.vue`、`app/components/ExcelTable.vue`；`Menu.vue` 與 `index.vue` 拿掉「Excel 表格」 |
| JSON / Excel 範例 | `server/api/readJson.get.js`、`server/api/readXLSX.get.js`、`server/assets/`；`package.json` 移除 `xlsx`；`index.vue` 拿掉按鈕 |
| Docker / k8s | `Dockerfile`、`.dockerignore`、`.drone.yml`、`yaml/` |
| pm2 | `ecosystem.config.js` |

刪完記得把 `app/app.config.ts` 和 `app/middleware/features.global.js` 裡對應的項目一起拿掉。

## 環境變數

| 變數 | 說明 |
|---|---|
| `NUXT_JWT_SECRET` | JWT 簽章密鑰（auth 開啟時必填） |
| `NUXT_LDAP_URL` | `ldap://host`（auth 開啟時必填） |
| `NUXT_LDAP_DOMAIN` | 登入時組成 `帳號@DOMAIN`（auth 開啟時必填） |
| `NUXT_UPLOAD_DIR` | 上傳目錄，預設 `uploads`。容器內請掛 volume，例如 `/uploads`。excel 的表格也存在這裡（`excel-table.json`） |

Nuxt 會把 `NUXT_` 前綴的環境變數對應到 `runtimeConfig`，所以不用重新打包 image 就能改設定。

## API

| 路由 | 說明 |
|---|---|
| `POST /api/auth/login` | `{ username, password }`，成功設 `ad_session` cookie（2 小時） |
| `POST /api/auth/logout` | 清 cookie |
| `GET /api/auth/me` | `{ loggedIn, user }` |
| `GET /api/files` | 檔案清單 |
| `POST /api/files/upload` | multipart 上傳，同名覆蓋 |
| `GET /api/files/download?name=` | 下載 |
| `POST /api/excel/upload` | multipart 上傳一個 .xlsx / .xls / .csv，第一個工作表存成表格（覆蓋前一張） |
| `GET /api/excel` | 目前的表格 `{ name, headers, rows }`，尚未上傳回 `null` |
| `PUT /api/excel` | 儲存編輯後的表格，body 同上 |
| `GET /api/excel/export` | 把表格匯出成 .xlsx 下載 |
| `GET /api/readJson` | 讀 `server/assets/example.json` |
| `GET /api/readXLSX` | 讀 `server/assets/example.xlsx` 第一個工作表 |

## 部署

### Docker

```bash
docker build -t zz-frame .
docker run -p 3000:3000 --env-file .env -v ./uploads:/uploads zz-frame
```

### pm2

```bash
npm run build
pm2 start ecosystem.config.js   # port 3030，環境變數放 .env 或 ecosystem 的 env 區塊
```

### k8s（Gitea + Drone + Harbor）

1. `yaml/` 和 `.drone.yml` 裡的 `<HARBOR_HOST>`、`<K8S_HOST>`、`<K8S_USER>`、`<NAS_IP>` 換成實際值
2. Drone 介面設定 secret：`harbor_username`、`harbor_password`、`ssh_key`
3. 建立環境變數 secret（名稱不能有底線）：

```bash
kubectl create secret generic zz-frame-dep-secret --from-env-file=.env
```

4. 依序 apply：`yaml/nfs/`（或 `yaml/smb/`）→ `yaml/deployment/` → `yaml/svc/` → `yaml/ingress/`

`smb-secret.yaml` 已在 `.gitignore`，內容：

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: smb-secret
type: Opaque
stringData:
  username: NAS帳號
  password: NAS密碼
```

`yaml/ingress/ingress-nginx-controller.yaml` 是 `kubectl get -o yaml` 匯出的參考檔（重點是 `hostNetwork: true`），不是直接 apply 用的。

## 目錄

```
app/
  app.config.ts        功能開關
  error.vue            全域錯誤頁
  components/          Navbar、Menu、FileManager
  composables/         useFeatures
  middleware/          auth.global、features.global、guest
  pages/               index、login、files、[...slug]（404）
  stores/              auth、counter
server/
  api/auth/            login、logout、me
  api/files/           index、upload、download
  api/                 readJson、readXLSX
  assets/              範例資料，會打包進 .output
  plugins/             啟動時環境變數檢查
  utils/               requireAuth、resolveInside（路徑穿越防護）
yaml/                  k8s 腳本
docs/DECISIONS.md      這次整併的分析與決策紀錄
```
