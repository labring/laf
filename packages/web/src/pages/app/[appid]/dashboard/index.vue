<script setup lang="ts">
import { useAppStore } from '~/store'

const appStore = useAppStore()
const {
  currentApp: app,
  appDeployUrlSchema: schema,
  appDeployHost: domain,
} = appStore
const getAppUrl = `${schema}://${app.appid}.${domain}`
</script>

<template>
  <div>
    <div class="welcome mb-24px">
      <h1 class="text-xl font-medium">
        欢迎使用 LaF 云开发！
      </h1>
    </div>
    <div class="introduce row">
      <el-descriptions
        title="应用信息"
        :column="2"
        size="large"
        border
      >
        <el-descriptions-item label="应用名：">
          {{ app.name }}
        </el-descriptions-item>
        <el-descriptions-item label="应用ID：" :span="2">
          {{ app.appid }}
        </el-descriptions-item>
        <el-descriptions-item label="使用文档：">
          <a target="_blank" class="blank" href="https://lafjs.github.io/">https://lafjs.github.io/</a>
        </el-descriptions-item>
        <el-descriptions-item label="服务地址：">
          <a href="getAppUrl" class="blank" target="_blank"> {{ getAppUrl }}</a>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<route lang="yaml">
name: 欢迎
meta:
  title: 欢迎
  index: 0-0
</route>

