<script setup>
const route = useRoute()
</script>

<template lang="pug">
.notfound-page
  NuxtLink(to='/') 回首頁
  h1 {{ route.params.slug }} Not Found
</template>

<style lang="stylus" scoped>
.notfound-page
  size(,100vh)
  flex(,,column-reverse)
  color colorSecondary
  background-color colorPrimary
  a
    text-decoration none
    font-size 1.2rem
    padding 0.8rem
    margin 1rem
    border-radius 1rem
    border 1px solid colorSecondary
    color colorSecondary
    font-weight 900
</style>
