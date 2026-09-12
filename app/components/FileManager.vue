<script setup>
import {
  NCard,
  NSpace,
  NButton,
  NUpload,
  NUploadDragger,
  NProgress,
  NList,
  NListItem,
  NIcon,
  NScrollbar,
  useNotification,
} from "naive-ui"
import { Upload } from "@vicons/tabler"

// 上傳限制和 server 端讀同一份設定
const { maxSizeMB, maxFiles } = useFeatures().files
const limitText = `最多同時上傳 ${maxFiles} 個檔案，每個不得超過 ${maxSizeMB}MB。`

const files = ref([])
const uploadProgress = ref(0)
const notification = useNotification()

const onProgress = ({ percent }) => {
  uploadProgress.value = Math.round(percent)
}

const onUploadFinish = async ({ file }) => {
  uploadProgress.value = 0
  notification.success({ title: "上傳成功", content: `${file.name} 已上傳完成`, duration: 3000 })
  await loadFiles()
}

const onUploadError = ({ file }) => {
  uploadProgress.value = 0
  notification.error({ title: "上傳失敗", content: `${file.name}：${limitText}`, duration: 4000 })
}

const onExceed = () => {
  notification.warning({ title: "上傳限制", content: limitText, duration: 4000 })
}

const loadFiles = async () => {
  try {
    files.value = await $fetch("/api/files")
  } catch (err) {
    console.error("載入檔案清單失敗:", err)
  }
}

const downloadFile = (filename) => {
  window.open(`/api/files/download?name=${encodeURIComponent(filename)}`, "_blank")
}

onMounted(loadFiles)
</script>

<template lang="pug">
.file-manager
  NCard(title="檔案管理")
    div
      h3 上傳檔案
      NScrollbar(style="max-height: 200px;")
        NUpload(
          name="files"
          action="/api/files/upload"
          multiple
          directory-dnd
          :max="maxFiles"
          with-credentials
          response-type="json"
          @finish="onUploadFinish"
          @progress="onProgress"
          @error="onUploadError"
          @exceed="onExceed"
        )
          NUploadDragger
            NIcon(size="40" color="#555")
              Upload
            p 拖曳檔案到這裡，或點擊選擇檔案上傳
            p.hint {{ limitText }}
      NProgress(v-if="uploadProgress > 0 && uploadProgress < 100"
          :percentage="uploadProgress"
          type="line"
          indicator-placement="outside"
          processing)
    div
      h3 已上傳檔案
      NScrollbar(style="max-height: 200px; margin-bottom: 1rem;")
        NList(bordered)
          NListItem(v-for="file in files" :key="file")
            NSpace(justify="space-between" align="center")
              span {{ file }}
              NButton(size="small" tertiary @click="downloadFile(file)") 下載
</template>

<style lang="stylus">
.file-manager
  size()
  flex()
  .n-card
    size()

h3
  margin-top 1rem

.hint
  font-size 0.8rem
  opacity 0.7
</style>
