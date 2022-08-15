<script lang="ts" setup>
import { LogoGithub } from '@vicons/carbon'
// import LanguageMenu from './LanguageMenu.vue'
import Multitab from './Multitab/Tabs.vue'
import UserMenu from './UserMenu.vue'
</script>

<template>
  <div class="flex justify-between items-center ml-12px h-full">
    <div>
      <Multitab />
    </div>

    <div class="icons">
      <el-space size="large">
        <el-tooltip content="查看文档" placement="bottom">
          <a class="icon text-slate-800 h-24px" target="_blank" href="https://docs.lafyun.com/">
            <el-icon :size="24">
              <QuestionFilled />
            </el-icon>
          </a>
        </el-tooltip>
        <el-tooltip content="Github" placement="bottom">
          <a class="icon text-slate-800 h-24px" target="_blank" href="https://github.com/labring/laf">
            <el-icon :size="24">
              <LogoGithub />
            </el-icon>
          </a>
        </el-tooltip>
        <!-- <LanguageMenu /> -->
        <UserMenu />
      </el-space>
    </div>
  </div>
</template>

