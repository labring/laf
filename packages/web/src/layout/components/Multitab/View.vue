<script lang="ts" setup>
import { useTabStore } from '~/store'

const tabStore = useTabStore()
</script>

<template>
  <div>
    <router-view v-if="tabStore.visitedViews.length > 0" v-slot="{ Component, route }">
      <keep-alive :include="tabStore.cachedViews">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </router-view>
    <slot v-else />
  </div>
</template>
