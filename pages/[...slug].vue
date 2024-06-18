<script setup>
const route = useRoute()
const event = useRequestEvent()
setResponseStatus(event, 404)
</script>

<template lang="pug">
.notfound-page
  NuxtLink(to='/') 回首頁
  h1 {{ route.params.slug }} Not Found
  //- p {{ route.params.slug }}
</template>

<style lang="stylus" scoped>
.notfound-page
  size(,100vh)
  flex(,,column-reverse)
  color colorSecondary
  background-color colorPrimary
  h1
    // text-shadow 4px 4px 4px colorSecondary
    transition .5s
  a
    text-decoration none
    font-size 1.2rem
    padding 0.8rem
    margin 1rem
    border-radius 1rem
    border 1px solid colorSecondary
    // box-shadow 4px 4px 12px colorSecondary
    color colorSecondary
    font-weight 900
    transition .5s
    &:hover
      box-shadow none
      ~ h1
        text-shadow none
</style>
