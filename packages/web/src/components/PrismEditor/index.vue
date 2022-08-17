<script setup lang="ts">
import { computed, onMounted } from 'vue'
import Prism from 'prismjs'

const props = defineProps({
  code: {
    type: Object,
  },
  type: {
    type: String,
    default: 'html',
  },
  isShowlineNumbers: {
    type: Boolean,
    default: false,
  },
})
const lineNumbers = computed(() => {
  return props.isShowlineNumbers ? 'line-numbers' : ''
})
onMounted(() => {
  nextTick(() => {
    Prism.highlightAll() // 切换菜单重新渲染
  })
})
</script>

<template>
  <pre :class="`hx-scroll ${lineNumbers}`">
    <code :class="`language-${type}`" v-html="Prism.highlight(JSON.stringify(props.code, null, 2), Prism.languages.json, 'json')" />
 </pre>
</template>

