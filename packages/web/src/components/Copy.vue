<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
defineProps<{
  text: string
}>()

const { copy } = useClipboard()

function handleCopy(text: string) {
  copy(text)
  ElMessage({
    message: '复制成功',
    type: 'success',
    duration: 1000,
  })
}
</script>

<template>
  <span>
    <el-icon @click="handleCopy(text)">
      <CopyDocument />
    </el-icon>
  </span>
</template>
