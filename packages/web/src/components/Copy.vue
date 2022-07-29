<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
defineProps<{
  text: string
}>()

const { copy } = useClipboard()

function handleCopy(text: string) {
  copy(text)
  ElMessage({
    message: '已复制!',
    type: 'success',
    duration: 1000,
  })
}
</script>

<template>
  <el-icon @click="handleCopy(text)">
    <CopyDocument />
  </el-icon>
</template>
