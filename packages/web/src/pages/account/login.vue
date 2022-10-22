<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import LanguageMenu from '~/layout/components/LanguageMenu.vue'
import { useUserStore } from '~/store/user'
import { requiredField } from '~/utils/form'
import { useLoading } from '~/composables'
const { t } = useI18n()
const { loading, withAsyncLoading } = useLoading()

const router = useRouter()
const goPage = (page: string) => {
  router.push(page)
}

const userStore = useUserStore()
const loginFormRef = $ref<FormInstance>()
const loginForm = $ref({
  username: '',
  password: '',
})

const loginRules = computed(() => ({
  username: [
    requiredField(t('pages.account.login.account')),
  ],
  password: [
    requiredField(t('pages.account.login.password')),
  ],
}))
const login = withAsyncLoading(async (loginEl: FormInstance | undefined) => {
  if (!loginEl)
    return

  await loginEl.validate()

  const { username, password } = loginForm

  const res = await userStore.login(username, password) as any

  if (res.error)
    loginForm.password = ''

  goPage('/apps')
})
</script>

<template>
  <div>
    <el-card w-lg mt-20 ma>
      <template #header>
        <div flex justify-between items-center>
          <span text-6 font-medium>{{ $t('pages.account.login.title') }}</span>
          <el-button type="primary" link text @click="goPage('/register')">
            {{ $t('pages.account.register.title') }}
          </el-button>
        </div>
      </template>
      <el-form
        ref="loginFormRef" :model="loginForm" label-width="100px" label-position="top" :rules="loginRules"
        autocomplete="off"
      >
        <el-form-item :label="$t('pages.account.login.account')" prop="username">
          <el-input v-model="loginForm.username" size="large" />
        </el-form-item>
        <el-form-item :label="$t('pages.account.login.password')" mt-6 prop="password">
          <el-input v-model="loginForm.password" size="large" type="password" @keyup.enter="login(loginFormRef)" />
        </el-form-item>
        <el-form-item mt-10>
          <el-button size="large" type="success" w-screen :loading="loading" @click="login(loginFormRef)">
            {{ $t('pages.account.login.login-btn') }}
          </el-button>
        </el-form-item>
      </el-form>
      <div text-center>
        <LanguageMenu show-name />
      </div>
    </el-card>
  </div>
</template>

<route lang="yaml">
name: login
meta:
  title: t('pages.account.login.title')
</route>
