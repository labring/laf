<script lang="ts" setup>
import type { RouteLocationNormalized } from 'vue-router'
import { useTabStore } from '~/store'

const props = defineProps<{
  view: RouteLocationNormalized
}>()

const tabStore = useTabStore()
const router = useRouter()

function deleteView () {
  const index = tabStore.getViewIndex(props.view)
  if (index === -1) return
  tabStore.deleteView(props.view)
  router.push(
    tabStore.getRouteLocation(
      tabStore.visitedViews[Math.min(index, tabStore.visitedViews.length - 1)]
    )
  )
}
</script>

<template>
  <el-tag class="mx-1 cursor-pointer" :effect="view.path === $route.path ? 'dark' : 'plain'" :closable="tabStore.visitedViews.length > 1" @close="deleteView" @click="$router.push(tabStore.getRouteLocation(view))">
    {{ view.meta.title }}
  </el-tag>
</template>

<style scoped></style>
