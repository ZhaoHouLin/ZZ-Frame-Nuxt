<script setup>
import MenuOpenFilledIcon from "./icons/IconMenuOpenFilled.vue"
import gsap from "gsap"
import {
  NDrawer,
  NDrawerContent,
  NGlobalStyle,
  NTimeline,
  NTimelineItem,
} from "naive-ui"

// route
const route = useRoute()
const router = useRouter()

// const
const showOuter = ref(false)
const showInner = ref(false)
const list = ref()
const drawer = ref()

const animateDrawerContent = () => {
  nextTick(() => {
    const items = gsap.utils.toArray(".list a")
    if (items) {
      items.forEach((item) => {
        if (item) {
          const tl = gsap.timeline({ paused: true }).to(item, {
            scale: 1.5,
            backgroundImage: "linear-gradient(90deg,red 0%,red 100%,orange 0%)",
            x: 60,
          })
          item.addEventListener("mouseenter", () => tl.play())
          item.addEventListener("mouseleave", () => tl.reverse())
          // item.addEventListener("click", () => handleMenuOpen())
          // 將時間軸存儲在項目的數據集中
          item.dataset.timeline = tl
        }
      })
    }
  })
}

watch(showOuter, (newValue) => {
  if (newValue) {
    animateDrawerContent()
  }
})

onMounted(() => {
  gsap.defaults({ duration: 0.5 })
})
onBeforeUnmount(() => {
  gsap.killTweensOf(list.value)
})
</script>

<template lang="pug">
.menu
  .control(@click="showOuter = true")
    MenuOpenFilledIcon

  NDrawer.drawer(v-model:show="showOuter" :width="300" )
    .created
      h5 v1.1.1 created by 
      a(href="mailto:fixer2@cdc.gov.tw") ZZ
    NDrawerContent(title='Menu' closable)
      .list(ref='list')
        NuxtLink(to='/' @click="showOuter = false") 首頁
        NuxtLink(to='/1' @click="showOuter = false") 1
        NuxtLink(to='/2' @click="showOuter = false") 2
        a(@click="showInner = true") 3

    NDrawer.inner-drawer(v-model:show="showInner" :width="400" placement='left')
      NDrawerContent(title='更新內容')
        .drawer-content 
          NTimeline(size="large")
            NTimelineItem( color="rgb(255,255,255)"  title="title 6"  content="content 6" time="2024-06-18")
            NTimelineItem( color="rgb(255,255,255)"  title="title 5"  content="content 5" time="2024-06-14")
            NTimelineItem( color="rgb(255,255,255)"  title="title 4"  content="content 4" time="2024-06-06")
            NTimelineItem( color="rgb(255,255,255)"  title="title 3"  content="content 3" time="2024-06-05")
            NTimelineItem( color="rgb(255,255,255)"  title="title 2"  content="content 2" time="2024-06-04")
            NTimelineItem( color="rgb(255,255,255)" title="title 1"  content="content 1" time="2024-06-03")
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
      // margin-bottom 2px

.n-drawer-body
  overflow hidden

.n-timeline-item-timeline__circle
  background-color colorSecondary
</style>
