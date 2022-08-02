<script lang="ts" setup>
import TopBar from './components/TopBar.vue'
import SideBar from './components/SideBar/index.vue'
</script>

<template>
  <el-container>
    <el-header style="--el-header-padding: 0; z-index: 9; margin-bottom: 2px;">
      <TopBar />
    </el-header>

    <el-container style="height: calc(100vh - 64px)">
      <el-aside width="240px">
        <el-scrollbar>
          <SideBar />
        </el-scrollbar>
      </el-aside>

      <el-container>
        <el-main style="padding: 0">
          <el-scrollbar>
            <div class="m-24px">
              <router-view />
            </div>
          </el-scrollbar>
        </el-main>
      </el-container>
    </el-container>
  </el-container>
</template>
