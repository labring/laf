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
    <div class="welcome">
      欢迎使用 LaF 云开发！
    </div>
    <div class="introduce row">
      <div class="label">
        使用文档：
      </div>
      <div class="content">
        <a style="color: blue" target="_blank" href="https://lafjs.github.io/">https://lafjs.github.io/</a>
      </div>
    </div>
    <div class="row">
      <div class="label">
        应用名：
      </div>
      <div class="content">
        {{ app.name }}
      </div>
    </div>
    <div class="row">
      <div class="label">
        应用ID：
      </div>
      <div class="content">
        {{ app.appid }}
      </div>
      <!-- <i v-clipboard:message="app.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" /> -->
    </div>
    <div class="row">
      <div class="label">
        服务地址：
      </div>
      <div class="content">
        <a style="color: black; text-decoration: undeline"> {{ getAppUrl }}</a>
        <!-- <i v-clipboard:message="getAppUrl()" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" /> -->
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
name: 欢迎
meta:
  title: 欢迎
  index: 0-0
</route>

<style scoped>
.application-container {
  padding-top: 160px;
}

.welcome {
  width: 400px;
  margin: 0 auto;
  font-size: 26px;
  color: rgba(218, 165, 32);
  margin-bottom: 80px;
}

.row {

  width: 700px;
  margin: 0 auto;
  margin-top: 20px;
  display: flex;
}

.row .label {
  text-align: left;
  width: 80px;
  color: rgb(82, 80, 80);
  font-size: 16;
}

.row .content {
  color: black;
  padding-left: 10px;
}

.copy-btn {
  color: green;
  font-size: 16px;
  margin-left: 10px;
  cursor: pointer;
}
</style>
