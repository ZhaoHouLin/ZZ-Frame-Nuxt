<template lang="pug">
.navbar
  NuxtLink(to='/')
    h1 ZZ-Frame

  Menu
</template>

<style lang="stylus" scoped>
.navbar
  position fixed
  z-index 2
  size(,32px)
  background-color colorPrimary
  border-bottom 1px solid
  border-image-source linear-gradient(-45deg, colorSecondary, colorTertiary)
  border-image-slice 1
  padding 1rem
  flex(flex-end,,)
  top 0
  a
    size(auto)
    position absolute
    left 2rem
    text-decoration none
  a h1
    background linear-gradient(45deg, colorSecondary, colorTertiary)
    background-clip text
    -webkit-background-clip text
    color transparent
</style>
