<script lang="ts" setup>
import { LogoGithub } from '@vicons/carbon'
import LanguageMenu from './LanguageMenu.vue'
import UserMenu from './UserMenu.vue'
</script>

<template>
  <div class="topbar-container">
    <div>{{ $t('layout.topbar.title') }}</div>
    <div class="icons">
      <el-space size="large">
        <a class="icon" target="_blank" href="https://docs.lafyun.com/">
          <el-icon>
            <QuestionFilled />
          </el-icon>
        </a>
        <a class="icon" target="_blank" href="https://github.com/labring/laf">
          <el-icon>
            <LogoGithub />
          </el-icon>
        </a>
        <language-menu />
        <user-menu />
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
      @apply text-dark transition-all hover:text-neutral;
    }
  }
}
</style>

