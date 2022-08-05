<script lang="ts" setup>
import { LanguageOutlined } from '@vicons/material'
import { supportLanguages } from '~/modules/locales'
import { useConfigStore } from '~/store'

withDefaults(defineProps<{
  showName?: boolean
}>(), {
  showName: false,
})

const config = useConfigStore()
const langText = computed(() => {
  return supportLanguages.find(item => item.name === config.local.language)?.text || 'Language'
})
</script>

<template>
  <el-dropdown>
    <span class="text-slate-800 h-24px">
      <el-icon :size="24">
        <LanguageOutlined />
      </el-icon>
      <span v-if="showName" ml-1>{{ langText }}</span>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="lang in supportLanguages" :key="lang.name" :disabled="config.local.language === lang.name" @click="config.local.language = lang.name">
          {{ lang.text }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
