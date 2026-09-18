<script setup>
import gsap from "gsap"
import {
  NDrawer,
  NDrawerContent,
  NIcon,
  NTimeline,
  NTimelineItem,
} from "naive-ui"
import { Menu2 } from "@vicons/tabler"

const features = useFeatures()
const auth = useAuthStore()

const showOuter = ref(false)
const showInner = ref(false)

const links = computed(() =>
  [
    { to: "/", label: "首頁" },
    features.files.enabled && { to: "/files", label: "檔案管理" },
    features.excel.enabled && { to: "/excel", label: "Excel 表格" },
  ].filter(Boolean)
)

// 每個連結一條 timeline，第一次 hover 時才建立，元素回收時一起釋放
const timelines = new WeakMap()
const timelineOf = (el) => {
  let tl = timelines.get(el)
  if (!tl) {
    tl = gsap.timeline({ paused: true }).to(el, {
      duration: 0.5,
      scale: 1.5,
      x: 60,
      backgroundImage: "linear-gradient(90deg,red 0%,red 100%,orange 0%)",
    })
    timelines.set(el, tl)
  }
  return tl
}
const hoverIn = (e) => timelineOf(e.currentTarget).play()
const hoverOut = (e) => timelineOf(e.currentTarget).reverse()

const close = () => (showOuter.value = false)
</script>

<template lang="pug">
.menu
  .control(@click="showOuter = true")
    NIcon(size="32")
      Menu2

  NDrawer.drawer(v-model:show="showOuter" :width="300")
    .created
      h5 created by
      a(href="mailto:you@example.com") ZZ
    NDrawerContent(title='Menu' closable)
      .list
        NuxtLink(v-for="l in links" :key="l.to" :to="l.to" @click="close" @mouseenter="hoverIn" @mouseleave="hoverOut") {{ l.label }}
        a(@click="showInner = true" @mouseenter="hoverIn" @mouseleave="hoverOut") 更新內容
        a(v-if="features.auth.enabled" @click="auth.logout" @mouseenter="hoverIn" @mouseleave="hoverOut") 登出

    NDrawer.inner-drawer(v-model:show="showInner" :width="400" placement='left')
      NDrawerContent(title='更新內容')
        .drawer-content
          NTimeline(size="large")
            NTimelineItem(color="rgb(255,255,255)" title="title 2" content="content 2" time="2024-06-04")
            NTimelineItem(color="rgb(255,255,255)" title="title 1" content="content 1" time="2024-06-03")
</template>

<style lang="stylus">
.menu
  position absolute

.control
  size(3rem)
  z-index 2
  margin-right 12px
  border-radius 1.2rem
  color colorSecondary
  cursor pointer

.list
  flex(,,column)
  a
    width 100%
    margin-bottom 8px
    text-decoration none
    font-size 1.2rem
    font-weight 900
    cursor pointer
    background-image linear-gradient(90deg,red 0%,red 0%,colorTertiary 0%)
    -webkit-background-clip text
    background-clip text
    -webkit-text-fill-color transparent
    text-fill-color transparent

.n-drawer
  .created
    flex(,flex-end)
    size(,auto)
    position absolute
    bottom 0
    padding 0.5rem
    border-top 1px solid colorSecondary
    background-color colorSecondary
    color #fff
    h5
      margin-right 0.5rem
    a
      text-decoration none
      outline none
      color #fff
      flex()

.n-drawer-body
  overflow hidden

.n-timeline-item-timeline__circle
  background-color colorSecondary
</style>
