<script setup>
import ErrorLayout from "~/layouts/errorLayout.vue"
</script>

<template lang="pug">
ErrorLayout( :error="{ statusCode: 500, message: 'An unexpected error occurred. Please try again later.' }")
</template>

<style lang="stylus" scoped></style>
