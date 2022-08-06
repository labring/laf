<script lang="ts" setup>
import { LogoGithub } from '@vicons/carbon'
import LanguageMenu from './LanguageMenu.vue'
import UserMenu from './UserMenu.vue'
import { useAppStore } from '~/store'
import * as appAPI from '~/api/application'
import router from '~/router'

const appId = (useAppStore().currentApp || {}).appid || ''

let apps = $ref<{ name: string; appid: string }[]>([])
const value = $ref<string>(appId)

async function change() {
  await router.push(`/app/${value}/dashboard`)
  location.reload()
}

onMounted(async () => {
  const res = await appAPI.getMyApplications()
  apps = res.data.created
})
</script>

<template>
  <div class="flex justify-between items-center ml-12px">
    <div v-if="appId !== ''" class="flex items-center">
      当前应用：
      <el-select v-model="value" class="m-2" placeholder="Select" size="large" @change="() => change()">
        <el-option
          v-for="item in apps"
          :key="item.appid"
          :label="item.name"
          :value="item.appid"
        />
      </el-select>
    </div>
    <div v-else>
      <div class="flex items-center logo-wrap px-12px py-12px w-240px">
        <img
          class="w-30px"
          alt="logo"
          src="/logo.png"
        ><span class="ml-8px"> {{ $t('layout.topbar.title') }}</span>
      </div>
    </div>

    <div class="icons">
      <el-space size="large">
        <a class="icon text-slate-800 h-24px" target="_blank" href="https://docs.lafyun.com/">
          <el-icon :size="24">
            <QuestionFilled />
          </el-icon>
        </a>
        <a class="icon text-slate-800 h-24px" target="_blank" href="https://github.com/labring/laf">
          <el-icon :size="24">
            <LogoGithub />
          </el-icon>
        </a>
        <LanguageMenu />
        <UserMenu />
      </el-space>
    </div>
  </div>
</template>

