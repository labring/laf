<script lang="ts" setup>
import { ElConfigProvider } from 'element-plus'

import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import SideBar from './components/SideBar/index.vue'
import TopBar from './components/TopBar.vue'
</script>

<template>
  <ElConfigProvider :locale="zhCn">
    <el-container>
      <el-header style="--el-header-padding: 0; z-index: 9; margin-bottom: 2px;">
        <TopBar />
      </el-header>

      <el-container style="height: calc(100vh - 64px)">
        <el-aside width="240px" style="box-shadow: rgba(0, 0, 0, 0.08) 0px 2px 5px 0px; z-index: 1">
          <el-scrollbar>
            <SideBar />
          </el-scrollbar>
        </el-aside>

        <el-container>
          <el-main style="padding: 8px; background: #f2f3f5;">
            <el-scrollbar>
              <div class="p-20px bg-white rounded">
                <router-view />
              </div>
            </el-scrollbar>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </ElConfigProvider>
</template>

<style global>
.el-scrollbar__thumb {
  width: 4px !important;
}
</style>
