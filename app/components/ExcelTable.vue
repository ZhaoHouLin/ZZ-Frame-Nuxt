<script setup>
import {
  NCard,
  NSpace,
  NButton,
  NUpload,
  NDataTable,
  NInput,
  NList,
  NListItem,
  NScrollbar,
  useNotification,
} from "naive-ui"

const notification = useNotification()
const table = ref(null) // { name, headers, rows: [{ id, cells }], log }
let base = [] // 載入時的列快照，儲存時拿來算「我改了什麼」

const snapshot = (rows) => rows.map((r) => ({ id: r.id, cells: [...r.cells] }))

const load = async () => {
  try {
    table.value = await $fetch("/api/excel")
    base = snapshot(table.value?.rows ?? [])
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
      h(NButton, { size: "small", tertiary: true, type: "error", onClick: () => removeRow(row.id) }, () => "刪除"),
  })
  return cols
})

const addRow = () => {
  table.value.rows.push({ id: crypto.randomUUID(), cells: table.value.headers.map(() => "") })
}

const removeRow = (id) => {
  table.value.rows = table.value.rows.filter((r) => r.id !== id)
}

// 只送差異：server 只套用我改過的格子，別人同時改的列不會被蓋掉
const save = async () => {
  try {
    const result = await $fetch("/api/excel", { method: "PUT", body: { base, rows: table.value.rows } })
    table.value = result
    base = snapshot(result.rows)
    notification.success({ title: "已儲存", content: `套用 ${result.applied} 項修改`, duration: 2000 })
  } catch (err) {
    notification.error({ title: "儲存失敗", content: err?.data?.message ?? String(err), duration: 4000 })
  }
}

const exportExcel = () => {
  window.open("/api/excel/export", "_blank")
}

const fmtTime = (iso) => new Date(iso).toLocaleString()
const fmtEntry = (e) => {
  if (e.kind === "add") return `新增一列（${e.rowKey}）`
  if (e.kind === "delete") return `刪除一列（${e.rowKey}）`
  return `${e.rowKey} 的「${e.col}」：${e.from || "（空）"} → ${e.to || "（空）"}`
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
        p.hint 目前表格：{{ table.name }}，{{ table.rows.length }} 列。直接在格子裡修改，改完按儲存。多人可同時編輯，儲存只套用你改過的格子。
        NDataTable(:columns="columns" :data="table.rows" :row-key="row => row.id" :bordered="true" :single-line="false" :scroll-x="Math.max(800, table.headers.length * 140)" max-height="50vh")
        NSpace
          NButton(@click="addRow") 新增一列
          NButton(type="primary" @click="save") 儲存
          NButton(@click="exportExcel") 匯出 Excel
        template(v-if="table.log && table.log.length")
          h3 修改紀錄
          NScrollbar(style="max-height: 200px;")
            NList(size="small" bordered)
              NListItem(v-for="(e, i) in table.log" :key="i")
                span.time {{ fmtTime(e.at) }}
                span {{ fmtEntry(e) }}
      p.hint(v-else) 還沒有表格，先匯入一個 Excel。
</template>

<style lang="stylus">
.excel-table
  size()
  flex()
  padding 1rem
  .n-card
    size()

h3
  margin-top 1rem

.hint
  font-size 0.8rem
  opacity 0.7

.time
  margin-right 0.75rem
  opacity 0.6
  font-size 0.85rem
</style>
