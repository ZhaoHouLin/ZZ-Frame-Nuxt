<script setup>
import {
  NCard,
  NSpace,
  NButton,
  NUpload,
  NDataTable,
  NInput,
  useNotification,
} from "naive-ui"

const notification = useNotification()
const table = ref(null) // { name, headers, rows }

const load = async () => {
  try {
    table.value = await $fetch("/api/excel")
  } catch (err) {
    console.error("載入表格失敗:", err)
  }
}

const onUploadFinish = async ({ file }) => {
  notification.success({ title: "已匯入", content: file.name, duration: 3000 })
  await load()
}

const onUploadError = ({ file }) => {
  notification.error({ title: "匯入失敗", content: `${file.name}：只接受 .xlsx / .xls / .csv，不超過 20MB`, duration: 4000 })
}

// NDataTable 需要物件列與 row-key；rows 是陣列，包一層
const data = computed(() =>
  (table.value?.rows ?? []).map((cells, index) => ({ key: index, cells }))
)

const columns = computed(() => {
  if (!table.value) return []
  const cols = table.value.headers.map((title, i) => ({
    title,
    key: i,
    minWidth: 120,
    render: (row) =>
      h(NInput, {
        value: row.cells[i],
        size: "small",
        onUpdateValue: (v) => (row.cells[i] = v),
      }),
  }))
  cols.push({
    title: "",
    key: "actions",
    width: 72,
    render: (row) =>
      h(NButton, { size: "small", tertiary: true, type: "error", onClick: () => removeRow(row.key) }, () => "刪除"),
  })
  return cols
})

const addRow = () => {
  table.value.rows.push(table.value.headers.map(() => ""))
}

const removeRow = (index) => {
  table.value.rows.splice(index, 1)
}

const save = async () => {
  try {
    table.value = await $fetch("/api/excel", { method: "PUT", body: table.value })
    notification.success({ title: "已儲存", duration: 2000 })
  } catch (err) {
    notification.error({ title: "儲存失敗", content: err?.data?.message ?? String(err), duration: 4000 })
  }
}

const exportExcel = () => {
  window.open("/api/excel/export", "_blank")
}

onMounted(load)
</script>

<template lang="pug">
.excel-table
  NCard(title="Excel 表格")
    NSpace(vertical)
      NUpload(
        name="file"
        action="/api/excel/upload"
        accept=".xlsx,.xls,.csv"
        :max="1"
        :show-file-list="false"
        with-credentials
        response-type="json"
        @finish="onUploadFinish"
        @error="onUploadError"
      )
        NButton 匯入 Excel
      template(v-if="table")
        p.hint 目前表格：{{ table.name }}，{{ table.rows.length }} 列。直接在格子裡修改，改完按儲存。
        NDataTable(:columns="columns" :data="data" :bordered="true" :single-line="false" :scroll-x="Math.max(800, table.headers.length * 140)" max-height="60vh")
        NSpace
          NButton(@click="addRow") 新增一列
          NButton(type="primary" @click="save") 儲存
          NButton(@click="exportExcel") 匯出 Excel
      p.hint(v-else) 還沒有表格，先匯入一個 Excel。
</template>

<style lang="stylus">
.excel-table
  size()
  flex()
  padding 1rem
  .n-card
    size()

.hint
  font-size 0.8rem
  opacity 0.7
</style>
