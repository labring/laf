<script lang="ts" setup>
import { ref } from 'vue'

const dialogEl = ref()

const setRef = (el: any) => dialogEl.value = el
</script>

<template>
  <slot :set-ref="setRef" :open="dialogEl?.open" />
</template>

<style scoped>
</style>
