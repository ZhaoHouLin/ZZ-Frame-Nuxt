<script setup>
import { NCard, NInput, NButton } from "naive-ui"

definePageMeta({
  middleware: "guest",
})

const auth = useAuthStore()
const username = ref("")
const password = ref("")
const message = ref("")
const loading = ref(false)

const login = async () => {
  loading.value = true
  message.value = ""
  try {
    await auth.login(username.value, password.value)
    await navigateTo("/")
  } catch (err) {
    message.value = err.data?.message || "登入失敗"
  } finally {
    loading.value = false
  }
}
</script>

<template lang="pug">
.login-container
  NCard(title="使用者登入")
    NInput(v-model:value="username" placeholder="帳號" style="margin-bottom: 10px;" @keyup.enter="login")
    NInput(v-model:value="password" placeholder="密碼" type="password" style="margin-bottom: 10px;" @keyup.enter="login")
    NButton(type="primary" block :loading="loading" @click="login") 登入
    p.message(v-if="message") {{ message }}
</template>

<style lang="stylus" scoped>
.login-container
  flex()
  size(300px)
.message
  margin-top 10px
  color colorSecondary
  text-align center
</style>
