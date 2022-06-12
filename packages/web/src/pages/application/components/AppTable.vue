<script setup lang="ts">
import dayjs from 'dayjs'
import { formatSpec } from '~/utils'
import * as appAPI from '~/api/application'
import { exportRawBlob } from '~/utils/file'

const props = defineProps<{
  type: string
  apps: any[]
  loading: boolean
}>()

const emit = defineEmits(['showUpdateDialog', 'showImportDialog', 'getApplications'])

const { loading } = toRefs(props)
const serviceLoading = $ref<any>(new Map())

const handleCopy = (text: string) => {
  const { copy } = useClipboard()
  copy(text)
  ElMessage.success('APP ID 已复制！')
}

const getRuntimeVersion = (app) => {
  const image = app.runtime?.image
  if (!image)
    return 'unknown'
  const [, version] = image.split(':')
  return version || 'unknown'
}

const startApp = async (app: any) => {
  const { appid } = app
  serviceLoading.set(appid, true)
  const res = await appAPI.startApplicationInstance(appid)
  serviceLoading.delete(appid)

  if (res.data)
    emit('getApplications')
}

const stopApp = async (app) => {
  const { appid } = app
  serviceLoading.set(appid, true)
  const res = await appAPI.stopApplicationInstance(appid)
  serviceLoading.delete(appid)
  if (res.data)
    emit('getApplications')
}

const restartApp = async (app) => {
  if (app.status !== 'running')
    return

  const { appid } = app
  serviceLoading.set(appid, true)
  const res = await appAPI.restartApplicationInstance(appid)
  serviceLoading.delete(appid)
  if (res.data)
    emit('getApplications')
}

const deleteApp = async (app) => {
  const { appid } = app
  serviceLoading.set(appid, true)
  const res = await appAPI.removeApplication(appid)
  serviceLoading.delete(appid)
  if (res.data)
    emit('getApplications')
}

const exportApp = async (app) => {
  const { appid } = app
  loading.value = true
  const data = await appAPI.exportApplication(appid)
  loading.value = false

  const time = dayjs().format('YYYYMMDDHHmmss')
  const filename = `${app.name}_${time}.lapp`
  exportRawBlob(filename, data)
}

const toDetail = (app) => {
  if (app.status !== 'running')
    ElMessage.error('请先启动应用服务！')

  appAPI.openAppConsole(app)
}
</script>

<template>
  <el-card mt-6 :body-style="{ padding: 0 }">
    <template #header>
      {{ type === 'created' ? '我创建的应用' : '我加入的应用' }}
    </template>
    <el-table
      v-loading="loading"
      :data="apps"
      :empty-text="type === 'created' ? '暂无创建的应用' : '暂无加入的应用'"
      style="width: 100%"
    >
      <el-table-column align="center" label="App ID" min-width="100">
        <template #default="{ row }">
          <el-button text @click="handleCopy(row.appid)">
            {{ row.appid }}
            &nbsp;<el-icon><DocumentCopy /></el-icon>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用名" min-width="120">
        <template #default="{ row }">
          <span truncate color-blue-400 style="cursor:pointer;" @click="$emit('showUpdateDialog', row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用规格" min-width="80">
        <template #default="scope">
          <el-tooltip v-if="scope.row.spec" placement="top">
            <template #content>
              {{ formatSpec(scope.row.spec.spec).text }}
            </template>
            <el-tag type="info">
              {{ formatSpec(scope.row.spec.spec).label }}
            </el-tag>
          </el-tooltip>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="服务版本" min-width="80">
        <template #default="scope">
          {{ getRuntimeVersion(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="服务启停" align="center" width="240" class-name="small-padding">
        <template #default="{ row }">
          <el-button v-if="row.status === 'stopped' || row.status === 'created'" :loading="serviceLoading[row.appid]" plain type="success" size="small" @click="startApp(row)">
            启动
          </el-button>
          <el-button v-if="row.status === 'prepared_start'" :loading="true" plain type="info" size="small">
            准备启动
          </el-button>
          <el-button v-if="row.status === 'starting'" :loading="true" plain type="info" size="small">
            正在启动
          </el-button>
          <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="danger" size="small" @click="stopApp(row)">
            停止
          </el-button>
          <el-button v-if="row.status === 'prepared_stop'" :loading="true" plain type="info" size="small">
            准备停止
          </el-button>
          <el-button v-if="row.status === 'stopping'" :loading="true" plain type="info" size="small">
            停止中
          </el-button>
          <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="default" size="small" @click="restartApp(row)">
            重启
          </el-button>
          <el-button v-if="row.status === 'prepared_restart'" :loading="true" plain type="info" size="small">
            准备重启
          </el-button>
          <el-button v-if="row.status === 'restarting'" :loading="true" plain type="info" size="small">
            重启中
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" min-width="120">
        <template #default="{ row }">
          <span v-if="row.created_at">{{ row.created_at }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="320" class-name="small-padding">
        <template #default="{ row }">
          <el-tooltip content="编写云函数、查看日志、管理数据库、文件、成员协作等" effect="light" placement="top">
            <el-button type="success" size="small" @click="toDetail(row)">
              开发
            </el-button>
          </el-tooltip>
          <el-button type="default" size="small" :loading="loading" @click="exportApp(row)">
            导出
          </el-button>
          <el-button type="default" size="small" @click="$emit('showImportDialog', row)">
            导入
          </el-button>
          <el-tooltip v-if="type === 'created'" content="释放即完全删除应用，暂不可恢复，谨慎操作，仅应用创建者可执行此操作!" effect="light" placement="left">
            <el-button :disabled="row.status === 'running'" plain size="small" type="default" @click="deleteApp(row)">
              释放
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
