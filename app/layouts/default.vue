<script setup>
import {
  NMessageProvider,
  NConfigProvider,
  zhTW,
  dateZhTW,
  NNotificationProvider,
} from "naive-ui"

const color_primary = "rgb(34, 34, 34)"
// const color_secondary = "rgb(255, 0, 76)"
const color_secondary = "rgb(255, 144, 86)" //橘
// const color_tertiary = "rgb(138, 43, 226)"
// const color_tertiary = "rgb(255, 144, 86)"
const color_tertiary = "rgb(255, 0, 76)" //紅

const themeOverrides = {
  common: {
    primaryColor: color_secondary,
    primaryColorHover: color_secondary,
    primaryColorPressed: color_tertiary,
    textColor1: color_secondary,
    textColor2: color_tertiary,
    tabColor: color_primary,
    tableHeaderColor: color_primary, //表格header
    scrollbarColor: color_secondary, //卷軸顏色
  },
  Button: {
    border: `1px solid ${color_tertiary}`,
  },
  Drawer: {
    color: color_primary,
    titleTextColor: color_tertiary,
    textColor: color_secondary,
    headerBorderBottom: `1px solid rgba(255, 255, 255,.8)`,
  },
  Timeline: {
    titleTextColor: color_secondary,
    contentTextColor: "#fff",
    metaTextColor: "#fff",
  },
  Tabs: {
    tabColorSegment: color_secondary,
    fontWeightStrong: 900,
  },
  DataTable: {
    borderColor: color_secondary,
    tdColorHover: color_primary,
    tdColor: color_primary,
    tdTextColor: color_secondary,
  },
  Pagination: {
    itemTextColorActive: color_secondary, // 當前頁文字顏色
    itemTextColor: color_primary, // 文字顏色
    itemTextColorDisabled: color_secondary,
    itemColorDisabled: color_primary,
    itemBorderDisabled: "1px solid rgb(66, 250, 63)", //框線顏色(disabled)
    buttonIconColor: color_primary, //按鈕icon顏色
    buttonBorder: "1px solid rgb(0, 0, 0)", //按鈕框線顏色
    buttonBorderHover: "1px solid rgb(66, 250, 63)",
    buttonIconColorHover: color_secondary, //hover按鈕icon顏色
  },
}
</script>

<template lang="pug">
NConfigProvider(:theme-overrides='themeOverrides' :locale='zhTW' :date-locale='dateZhTW')
  NMessageProvider(placement="bottom-right")
    NNotificationProvider
      .content
        Navbar
        NuxtPage
</template>

<style lang="stylus">
.content
  size(,100vh)
  flex(,,column)
  overflow hidden
  background-color colorGray
</style>
