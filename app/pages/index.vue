<script setup>
import { NButton, NSpace } from "naive-ui"

const features = useFeatures()
const counter = useCounterStore()
const result = ref(null)

const getJson = async () => {
  result.value = await $fetch("/api/readJson")
}

const getXLSX = async () => {
  result.value = await $fetch("/api/readXLSX")
}
</script>

<template lang="pug">
.homepage
  NSpace(vertical align="center")
    NSpace
      NButton(@click="getJson") 讀 JSON 範例
      NButton(@click="getXLSX") 讀 XLSX 範例
      NButton(@click="counter.increment") count: {{ counter.count }} / double: {{ counter.double }}
    NuxtLink(v-if="features.files.enabled" to="/files") 檔案管理
    pre(v-if="result") {{ JSON.stringify(result, null, 2) }}
</template>

<style lang="stylus">
@font-face
  font-family 'ROGFonts-Regular'
  src url(@/assets/fonts/ROGFonts-Regular.woff) format('woff')

.homepage
  size()
  flex()
  background-color colorGray
  color #fff
  a
    color colorTertiary
  pre
    max-height 50vh
    overflow auto
    font-size 0.8rem
</style>
