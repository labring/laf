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
  <div class="topbar-container">
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
          src="https://docs.lafyun.com/logo.png"
        ><span class="ml-8px"> {{ $t('layout.topbar.title') }}</span>
      </div>
    </div>

    <div class="icons">
      <el-space size="large">
        <a class="icon" target="_blank" href="https://docs.lafyun.com/">
          <el-icon :size="24">
            <QuestionFilled />
          </el-icon>
        </a>
        <a class="icon" target="_blank" href="https://github.com/labring/laf">
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

<style lang="postcss">
.topbar-container {
  height: 60px;
  @apply flex items-center justify-between shadow-bluegray shadow-opacity-20 shadow-md pl pr;

  .icons {
    @apply flex items-center;

    .icon {
      line-height: 1em;
      @apply text-dark transition-all hover: text-neutral;
    }
  }
}
</style>

