<script setup>
const getJson = async () => {
  const data = await $fetch("/api/readJson", {
    method: "get",
  })
  console.log(data)
}

const getXLSX = async () => {
  const data = await $fetch("/api/readXLSX", {
    method: "get",
  })
  console.log(data)
}
</script>

<template lang="pug">
.homepage
  button(@click='getJson') get json
  button(@click='getXLSX') get XLSX
 
</template>

<style lang="stylus">
@font-face
  font-family 'ROGFonts-Regular'
  src url(@/assets/fonts/ROGFonts-Regular.woff) format('woff')

.homepage
  size()
  flex()
  background-color colorGray
  button
    font-family ROGFonts-Regular
  h1
    color #fff
</style>
