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

const router = useRouter()

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

const toDetail = (app: any) => {
  if (app.status !== 'running') {
    ElMessage.error('请先启动应用服务！')
    return
  }

  const { appid } = app
  const path = `/app/${appid}/dashboard`
  router.push(path)
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
          <el-button size="small" text @click="handleCopy(row.appid)">
            {{ row.appid }}
            &nbsp;<el-icon><DocumentCopy /></el-icon>
          </el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用名" min-width="120">
        <template #default="{ row }">
          <el-tooltip content="编写云函数、查看日志、管理数据库、文件、成员协作等" effect="light" placement="top">
            <span truncate color-blue-400 style="cursor:pointer;" @click="toDetail(row)">{{ row.name }}</span>
          </el-tooltip>
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
          <el-button v-if="row.status === 'stopped' || row.status === 'created'" size="small" :loading="serviceLoading[row.appid]" type="success" @click="startApp(row)">
            启动
          </el-button>
          <el-button v-if="row.status === 'prepared_start'" size="small" :loading="true" type="info">
            准备启动
          </el-button>
          <el-button v-if="row.status === 'starting'" size="small" :loading="true" type="info">
            正在启动
          </el-button>
          <el-button v-if="row.status === 'running'" size="small" :loading="serviceLoading[row.appid]" type="danger" @click="stopApp(row)">
            停止
          </el-button>
          <el-button v-if="row.status === 'prepared_stop'" size="small" :loading="true" type="info">
            准备停止
          </el-button>
          <el-button v-if="row.status === 'stopping'" size="small" :loading="true" type="info">
            停止中
          </el-button>
          <el-button v-if="row.status === 'running'" size="small" :loading="serviceLoading[row.appid]" type="default" @click="restartApp(row)">
            重启
          </el-button>
          <el-button v-if="row.status === 'prepared_restart'" size="small" :loading="true" type="info">
            准备重启
          </el-button>
          <el-button v-if="row.status === 'restarting'" size="small" :loading="true" type="info">
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
      <el-table-column fixed="right" label="操作" align="center" width="360" class-name="small-padding">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="toDetail(row)">
            进入开发
          </el-button>
          <el-button size="small" type="default" @click="$emit('showUpdateDialog', row)">
            编辑
          </el-button>
          <el-button size="small" type="default" :loading="loading" @click="exportApp(row)">
            导出
          </el-button>
          <el-button size="small" type="default" @click="$emit('showImportDialog', row)">
            导入
          </el-button>
          <template v-if="type === 'created'">
            <el-tooltip v-if="row.status === 'stopped' || row.status === 'created'" content="释放即完全删除应用，暂不可恢复，谨慎操作，仅应用创建者可执行此操作!" effect="light" placement="left">
              <el-popconfirm title="确认要释放应用吗？该操作不可撤回" cancel-button-text="否" confirm-button-text="是" @confirm="deleteApp(row)">
                <template #reference>
                  <el-button size="small" type="default">
                    释放
                  </el-button>
                </template>
              </el-popconfirm>
            </el-tooltip>
            <el-tooltip v-else content="请先停止应用" effect="light" placement="left">
              <div class="inline-block ml-12px">
                <el-button size="small" :disabled="true" type="default" @click="deleteApp(row)">
                  释放
                </el-button>
              </div>
            </el-tooltip>
          </template>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>
