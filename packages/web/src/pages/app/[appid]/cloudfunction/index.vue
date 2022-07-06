<script setup lang="ts">
import { useAppStore } from '~/store'

const route = useRoute()
const appid = route.params.appid

const appStore = useAppStore()
const app = appStore.currentApp
</script>

<template>
  cloud function index {{ appid }} {{ app }}
</template>

<route lang="yaml">
name: cloudFunction
meta:
  title: 云函数
  icon: cloud-function
  index: 1-0
</route>
