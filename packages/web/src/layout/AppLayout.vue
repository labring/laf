<script lang="ts" setup>
import TopBar from './components/TopBar.vue'
import SideBar from './components/SideBar/index.vue'
</script>

<template>
  <el-container fixed top-0 bottom-0 left-0 right-0>
    <el-header relative z-5 style="--el-header-padding: 0;">
      <top-bar />
    </el-header>

    <el-container>
      <side-bar />

      <el-main style="--el-main-padding: 0;" bg-light pt-10 flex>
        <el-scrollbar>
          <div p-6 h-screen>
            <router-view />
          </div>
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>
