<script setup>
// Nuxt 全域錯誤頁：放在 app/error.vue 才會被 Nuxt 接手，放 pages/ 只是一般路由
const props = defineProps({
  error: { type: Object, required: true },
})

const handleError = () => clearError({ redirect: "/" })
</script>

<template lang="pug">
.error-page
  button(type="button" @click="handleError") 清除錯誤後回到首頁
  p {{ props.error.message }}
  h1 {{ props.error.statusCode }}
</template>

<style lang="stylus" scoped>
.error-page
  size(,100vh)
  flex(,,column-reverse)
  color colorSecondary
  background-color colorPrimary
  h1
    font-size 10rem
  p
    text-align center
    font-size 3rem
    margin 1rem
  button
    background none
    font-size 1.2rem
    padding 0.8rem
    margin 1rem
    border-radius 1rem
    border 1px solid colorSecondary
    color colorSecondary
    font-weight 900
    cursor pointer
</style>
