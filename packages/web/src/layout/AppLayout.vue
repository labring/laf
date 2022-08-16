<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'

import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import SideBar from './components/SideBar/index.vue'
import TopBar from './components/TopBar.vue'
import MultitabView from './components/Multitab/View.vue'
const router = useRouter()
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <el-container class="h-screen">
      <el-aside width="240px" style="box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 5px 0px; z-index: 1">
        <el-scrollbar>
          <div class="flex items-center logo-wrap px-12px py-12px w-240px">
            <el-button link class="w-240px !justify-start" @click="() => router.push('/')">
              <img
                class="w-30px"
                alt="logo"
                src="/logo.png"
              ><span class="ml-8px"> {{ $t('layout.topbar.title') }}</span>
            </el-button>
          </div>
          <div class="pt-60px">
            <SideBar />
          </div>
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-header style="--el-header-height: 46px; --el-header-padding: 0; z-index: 9; margin-bottom: 2px;">
          <TopBar />
        </el-header>
        <el-main style="padding: 8px; background: #f2f3f5;">
          <el-scrollbar>
            <div class="p-20px bg-white rounded">
              <MultitabView />
            </div>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </ElConfigProvider>
</template>

<style global>
.el-scrollbar__thumb {
  width: 4px !important;
}
</style>

<style scoped>
  .logo-wrap {
    position: fixed;
    height: 49px;
    top: 0;
    background-color: #fff;
    z-index: 1;
  }
</style>
