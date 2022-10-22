<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import TabItem from './TabItem.vue'
import { useTabStore } from '~/store'

const tabStore = useTabStore()
const route = useRoute()

watch(route, () => {
  const newRoute = cloneDeep(route)
  if (tabStore.getView(newRoute)) {
    console.log('[Tab Manager] update views')
    tabStore.updateView(newRoute)
  }
  else {
    tabStore.addView(newRoute)
  }
}, {
  immediate: true,
})

onBeforeUnmount(() => {
  tabStore.clearView()
})
</script>

<template>
  <div>
    <TabItem v-for="tab in tabStore.visitedViews" :key="tab.path" :view="tab" />
  </div>
</template>

<style scoped>
</style>
