<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import * as useraApi from '~/api/user'
import LanguageMenu from '~/layout/components/LanguageMenu.vue'
import { maxLengthField, minLengthField, passwordField, requiredField } from '~/utils/form'
import { errorMsg, successMsg } from '~/utils/message'
import { useLoading } from '~/composables'
const { t } = useI18n()
const router = useRouter()
const { loading, withAsyncLoading } = useLoading()
const goLogin = () => {
  router.push('/login')
}

const registerFormRef = $ref<FormInstance>()
const registerForm = $ref({
  username: '',
  name: '',
  password: '',
  password2: '',
})
const registerRules = {
  username: [
    requiredField(t('pages.account.login.account')),
    minLengthField(4, t('pages.account.login.account')),
    maxLengthField(20, t('pages.account.login.account')),
  ],
  name: [
    requiredField(t('pages.account.register.name')),
  ],
  password: [
    requiredField(t('pages.account.login.password')),
    passwordField(t('pages.account.login.password')),
  ],
  password2: [
    requiredField(t('layout.components.reset-password.form.confirm-password')),
    passwordField(t('layout.components.reset-password.form.confirm-password')),
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== registerForm.password)
          callback(new Error(t('layout.components.reset-password.rules.confirm')))

        else
          callback()
      },
    },
  ],
}

const register = withAsyncLoading(async (registerEl: FormInstance | undefined) => {
  if (!registerEl)
    return

  await registerEl.validate()

  const { username, name, password } = registerForm

  const res = await useraApi.signup({ username, name, password }) as any

  if (res.error) {
    errorMsg(res.error)
    return
  }

  successMsg(t('pages.account.register.success-msg'))
  goLogin()
})
</script>

<template>
  <el-card w-sm mt-20 ma>
    <template #header>
      <div flex justify-between items-center>
        <span text-4>{{ $t('pages.account.register.title') }}</span>
        <el-button
          type="primary"
          text
          @click="goLogin"
        >
          {{ $t('pages.account.login.title') }}
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
      <el-form-item :label="$t('pages.account.login.account')" prop="username">
        <el-input v-model.trim="registerForm.username" />
      </el-form-item>
      <el-form-item :label="$t('pages.account.register.name')" mt-6 prop="name">
        <el-input v-model.trim="registerForm.name" />
      </el-form-item>
      <el-form-item :label="$t('pages.account.login.password')" mt-6 prop="password">
        <el-input v-model.trim="registerForm.password" type="password" />
      </el-form-item>
      <el-form-item :label="$t('layout.components.reset-password.form.confirm-password')" mt-6 prop="password2">
        <el-input v-model.trim="registerForm.password2" type="password" />
      </el-form-item>
      <el-form-item mt-10>
        <el-button
          type="success"
          plain
          w-screen
          :loading="loading"
          @click="register(registerFormRef)"
        >
          {{ $t('pages.account.register.title') }}
        </el-button>
      </el-form-item>
    </el-form>
    <div text-center>
      <LanguageMenu show-name />
    </div>
  </el-card>
</template>

<route lang="yaml">
name: register
meta:
  title: t('pages.account.register.title')
</route>
