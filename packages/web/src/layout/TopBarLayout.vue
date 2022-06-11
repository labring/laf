<script lang="ts" setup>
import TopBar from './components/TopBar.vue'
</script>

<template>
  <el-container fixed top-0 bottom-0 left-0 right-0>
    <el-header relative z-5 style="--el-header-padding: 0;">
      <top-bar />
    </el-header>

    <el-main style="--el-main-padding: 0;" bg-light>
      <el-scrollbar>
        <div p-1>
          <slot v-if="$slots.default" />
          <router-view v-else />
        </div>
      </el-scrollbar>
    </el-main>
  </el-container>
</template>
