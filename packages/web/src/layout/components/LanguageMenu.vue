<script lang="ts" setup>
import { LanguageOutlined } from '@vicons/material'
import { supportLanguages } from '~/locates'

const { locale } = useI18n()
</script>

<template>
  <el-dropdown>
    <span class="el-dropdown-link flex items-center cursor-pointer">
      <el-icon class="el-icon--right">
        <LanguageOutlined />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item v-for="lang in supportLanguages" :key="lang.name" :disabled="locale === lang.name" @click="locale = lang.name">
          {{ lang.text }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
