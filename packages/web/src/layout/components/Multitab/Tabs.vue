<template>
  <div>
    <TabItem v-for="tab in tabStore.visitedViews" :key="tab.path" :view="tab"></TabItem>
  </div>
</template>
<script lang="ts" setup>
import { cloneDeep } from 'lodash'
import { useTabStore } from '~/store'
import TabItem from './TabItem.vue'

const tabStore = useTabStore()
const route = useRoute()

watch(route, () => {
  const newRoute = cloneDeep(route)
  if (tabStore.getView(newRoute)) {
    console.log('[Tab Manager] update views')
    tabStore.updateView(newRoute)
  } else {
    tabStore.addView(newRoute)
  }
}, {
  immediate: true
})

onBeforeUnmount(() => {
  tabStore.clearView()
})

</script>
<style scoped>
</style>
