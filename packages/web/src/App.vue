<script lang="ts" setup>
import { initLanguageModule } from './modules/locales'

initLanguageModule()
</script>

<template>
  <main>
    <router-view />
  </main>
</template>
