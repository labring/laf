<script lang="ts" setup>
import { LogoGithub } from '@vicons/carbon'
import LanguageMenu from './LanguageMenu.vue'
import UserMenu from './UserMenu.vue'
import { useAppStore } from '~/store'

const appName = useAppStore().currentApp.name
</script>

<template>
  <div class="topbar-container">
    <div class="flex items-center">
      <img
        alt="logo"
        class="w-30px"
        src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_28dp.png"
      ><span class="ml-8px"> {{ $t('layout.topbar.title') }}</span>
      APP: <span class="text-primary">{{ appName }}</span>
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

