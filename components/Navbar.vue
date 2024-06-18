<script setup></script>

<template lang="pug">
.navbar
  NuxtLink(to='/')
    h1 ZZ-Frame

  Menu

  
</template>

<style lang="stylus" scoped>
--n-color-modal=#222

.navbar
  position fixed
  z-index 2
  size(,32px)
  // border 1px solid #000
  background-color colorPrimary
  border-bottom 1px solid
  border-image-source linear-gradient(-45deg, colorSecondary, colorTertiary)
  border-image-slice 1

  padding 1rem
  flex(flex-end,,)
  top 0
  button
    margin-right 1rem
  a
    size(auto)
    position absolute
    left 2rem
    text-decoration none
  a h1
    color colorPrimary
    background linear-gradient(45deg, colorSecondary, colorTertiary)
    background -webkit-linear-gradient(45deg, colorSecondary, colorTertiary)
    background-clip text
    -webkit-background-clip text
    color transparent


.disabled
  color gray
  border 1px solid gray
  pointer-events none
  user-select none

.icon
  size(32px)
  color colorSecondary
  margin-right 1rem
  cursor pointer
</style>
