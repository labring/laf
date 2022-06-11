<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { useUserStore } from '~/store/user'

const router = useRouter()
const goPage = (page: string) => {
  router.push(page)
}

const userStore = useUserStore()
let loading = $ref(false)
const loginFormRef = $ref<FormInstance>()
const loginForm = $ref({
  username: '',
  password: '',
})
const loginRules = {
  username: [
    { required: true, message: 'Please input your username!' },
  ],
  password: [
    { required: true, message: 'Please input your password!' },
  ],
}
const login = async (loginEl: FormInstance | undefined) => {
  if (!loginEl)
    return

  loginEl.validate(async (valid) => {
    if (!valid)
      return

    loading = true
    const { username, password } = loginForm

    const res = await userStore.login(username, password) as any

    loading = false
    if (res.error)
      loginForm.password = ''

    goPage('/application')
  })
}
</script>

<template>
  <el-card w-sm mt-20 ma>
    <template #header>
      <div flex justify-between items-center>
        <span text-4>{{ $t('pages.account.login.title') }}</span>
        <el-button type="primary" text @click="goPage('/register')">
          {{ $t('pages.account.register') }}
        </el-button>
      </div>
    </template>
    <el-form
      ref="loginFormRef" :model="loginForm" label-width="100px" label-position="top" :rules="loginRules"
      autocomplete="off"
    >
      <el-form-item label="账户" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入账户名" />
      </el-form-item>
      <el-form-item label="密码" mt-6 prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" @keyup.enter="login(loginFormRef)" />
      </el-form-item>
      <el-form-item mt-10>
        <el-button type="success" plain w-screen :loading="loading" @click="login(loginFormRef)">
          登录
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<route lang="yaml">
name: login
meta:
  title: 登录
</route>
