# 編譯環境
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
# --ignore-scripts 跳過 postinstall 的 nuxt prepare（build 會自己跑）
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

# 執行環境
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
