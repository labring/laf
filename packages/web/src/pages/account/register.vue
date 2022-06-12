<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as useraApi from '~/api/user'

const router = useRouter()
const goLogin = () => {
  router.push('/login')
}

let loading = $ref(false)
const registerFormRef = $ref<FormInstance>()
const registerForm = $ref({
  username: '',
  name: '',
  password: '',
  password2: '',
})
const registerRules = {
  username: [
    { required: true, message: 'Please input your username!' },
    { min: 4, message: 'Length should be greater than 4' },
    { max: 20, message: 'Length should be less than 20' },
  ],
  name: [
    { required: true, message: 'Please input your name!' },
  ],
  password: [
    { required: true, message: 'Please input your password!', trigger: 'blur' },
    { min: 8, message: 'Length should be greater than 8' },
  ],
  password2: [
    { required: true, message: 'Please input your password again!' },
    { min: 8, message: 'Length should be greater than 8' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password)
          callback(new Error('Two passwords that you enter is inconsistent!'))

        else
          callback()
      },
    },
  ],
}

const register = async (registerEl: FormInstance | undefined) => {
  if (!registerEl)
    return

  registerEl.validate(async (valid) => {
    if (!valid)
      return

    loading = true
    const { username, name, password } = registerForm

    const res = await useraApi.signup({ username, name, password }) as any

    loading = false
    if (res.error) {
      ElMessage({
        message: res.error,
        type: 'error',
      })
      return
    }

    ElMessage({
      message: '注册成功！',
      type: 'success',
    })
    goLogin()
  })
}
</script>

<template>
  <el-card w-sm mt-20 ma>
    <template #header>
      <div flex justify-between items-center>
        <span text-4>LAF 云开发账户注册</span>
        <el-button
          type="primary"
          text
          @click="goLogin"
        >
          去登录
        </el-button>
      </div>
    </template>
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      label-width="100px"
      label-position="top"
      :rules="registerRules"
      autocomplete="off"
    >
      <el-form-item label="账户" prop="username">
        <el-input v-model.trim="registerForm.username" placeholder="请输入账户名" />
      </el-form-item>
      <el-form-item label="姓名" mt-6 prop="name">
        <el-input v-model.trim="registerForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="密码" mt-6 prop="password">
        <el-input v-model.trim="registerForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="确认密码" mt-6 prop="password2">
        <el-input v-model.trim="registerForm.password2" type="password" placeholder="请再次输入密码" />
      </el-form-item>
      <el-form-item mt-10>
        <el-button
          type="success"
          plain
          w-screen
          :loading="loading"
          @click="register(registerFormRef)"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<route lang="yaml">
name: register
meta:
  title: 注册
</route>
