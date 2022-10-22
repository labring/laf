<script lang="ts" setup>
import { initLocaleModule } from './modules/locales'

initLocaleModule()
</script>

<template>
  <main>
    <router-view />
  </main>
</template>
