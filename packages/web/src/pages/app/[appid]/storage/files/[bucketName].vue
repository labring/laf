<script lang="ts" setup>
import { ElNotification } from 'element-plus'
import type { ReactiveVariable } from 'vue/macros.js'
import PathLink from './components/path-link.vue'
import * as oss from '~/api/oss'
import { byte2GbOrMb } from '~/utils/file'
const $route = useRoute()

const bucket = $route.params?.bucketName || ''

let bucketDetail: any = $ref({ name: '', mode: 'private', full_token: '', read_token: '', credentials: {}, objects: 0, size: 0, quota: 0 })
const tableKey = $ref(0)
let list: any = $ref([])
let currentPath = $ref('/')
let listLoading = $ref(false)
const listQuery = $ref({ page: 1, limit: 20 })
let dialogFormVisible = $ref(false)
let uploadCommand = $ref('uploadFile')
const uploadFileList = $ref([])

const bucketQuota = $computed(() => {
  return bucketDetail.quota ? byte2GbOrMb(bucketDetail.quota) : 0
})

const bucketSize = $computed(() => {
  return bucketDetail.size ? byte2GbOrMb(bucketDetail.size) : 0
})

const bucketObjects = $computed(() => {
  return bucketDetail.objects
})

function getList(upload = false) {
  if (listLoading)
    return
  listLoading = true

  const _getList = async () => {
    const res = await oss
      .getFilesByBucketName(bucket, {
        marker: undefined,
        prefix: currentPath,
        credentials: bucketDetail.credentials,
      })
      .finally(() => {
        listLoading = false
      })

    const files = res.Contents || []
    const dirs = res.CommonPrefixes || []
    list = [...files, ...dirs]
    listLoading = false
  }

  // 对多文件或文件夹上传做节流处理
  upload ? setTimeout(_getList, 1000) : _getList()
}

function handleFilter() {
  listQuery.page = 1
  getList()
}

function changeDirectory(row: { Prefix: ReactiveVariable<string> }) {
  if (!row.Prefix)
    return

  currentPath = row.Prefix
  listQuery.page = 1
  getList()
}

function onChangeDirectory(data: ReactiveVariable<string>) {
  currentPath = data
  listQuery.page = 1
  getList()
}

async function handleDelete(row: { Key: any }) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  // 执行删除请求
  const r = await oss.deleteAppFile(
    bucket,
    row.Key,
    bucketDetail.credentials,
  )

  if (r.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: `删除失败:${r.error}`,
    })
    return
  }

  ElNotification({
    type: 'success',
    title: '操作成功',
    message: '删除成功！',
  })

  getList()
}

async function createDirectory() {
  await ElMessageBox.prompt('', '请输入新文件夹名', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[^\\\/\:\*\?\"\<\>\|\.]+$/,
    inputErrorMessage: '文件夹不能包含 \\\ \/ : * ? " < > | 这些非法字符',
  })
    .then(async ({ value }) => {
      currentPath = `${currentPath + value}/`
      getList()
    })
    .catch((err) => {
      console.error(err)
    })
}

function getFileUrl(file: { Key: any }) {
  const url = oss.getAppFileUrl(
    bucket,
    file.Key,
    bucketDetail.credentials,
  )
  return url
}

function getFileName(file: { Key: string }) {
  return file.Key.split('/').at(-1)
}

function handleUploadCommand(command: string) {
  dialogFormVisible = true
  uploadCommand = command
  if (command === 'uploadFolder') {
    nextTick(() => {
      (document.getElementsByClassName(
        'el-upload__input',
      )[0] as any).webkitdirectory = true
    })
  }
  else {
    nextTick(() => {
      (document.getElementsByClassName(
        'el-upload__input',
      )[0] as any).webkitdirectory = false
    })
  }
}

async function handleUploadFile(param: { file: any }) {
  const file = param.file
  const _currentPath = currentPath === '/' ? '' : currentPath
  const fileName = file.webkitRelativePath
    ? file.webkitRelativePath
    : file.name
  const key = _currentPath + fileName
  const res = await oss.uploadAppFile(
    bucket,
    key,
    file,
    bucketDetail.credentials,
    { contentType: file.type },
  )
  if (res.$response?.httpResponse?.statusCode !== 200)
    return ElMessage.error(`文件上传失败：${key}`)

  ElMessage.success(`文件上传成功: ${key}`)
  getList(true)
}

function isImage(row: { Key: string }) {
  const key = row.Key?.toLowerCase()
  return (
    key?.endsWith('.png')
    || key?.endsWith('.jpeg')
    || key?.endsWith('.jpg')
    || key?.endsWith('.gif')
  )
}

function isVideo(row: { Key: string }) {
  const key = row.Key?.toLowerCase()
  return (
    key?.endsWith('.mp4')
    || key?.endsWith('.mov')
    || key?.endsWith('.mpeg')
    || key?.endsWith('.flv')
    || key?.endsWith('.avi')
  )
}

function getFileSize(file: { Size: number }) {
  const length = file.Size ?? 0
  if (length > 1024 * 1024 * 1024)
    return `${(length / (1024 * 1024 * 1024)).toFixed(2)} GB`

  else if (length > 1024 * 1024)
    return `${(length / (1024 * 1024)).toFixed(2)} MB`

  else if (length > 1024)
    return `${(length / 1024).toFixed(0)} kb`

  else if (length)
    return `${length} bytes`

  else
    return '-'
}

function setTagViewTitle() {
  const label = bucket
  const title = $route.meta.title
  const _route = Object.assign({}, $route, {
    title: `${label} - ${title}`,
  })
  // TODO
  // $store.dispatch('tagsView/updateVisitedView', route)
}

onMounted(async () => {
  const res = await oss.getOneBucket(bucket)
  bucketDetail = res.data
  getList()
  setTagViewTitle()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-button class="filter-item" type="primary" icon="Refresh" @click="handleFilter">
        刷新
      </el-button>
      <el-dropdown
        trigger="click" class="filter-item" style="margin-left: 10px; margin-right: 10px"
        @command="handleUploadCommand"
      >
        <el-button type="primary">
          <el-icon>
            <UploadFilled />
          </el-icon>上传<el-icon>
            <ArrowDown />
          </el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="uploadFile">
              上传文件
            </el-dropdown-item>
            <el-dropdown-item command="uploadFolder">
              上传文件夹
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button class="inline-block" type="primary" icon="Plus" @click="createDirectory">
        新建文件夹
      </el-button>
      <div class="inline-block" style="margin-left: 20px">
        <span style="font-size: 16px; color: gray; margin-right: 5px">当前:</span>
        <PathLink :path="currentPath" :bucket="bucket" @change="onChangeDirectory" />
      </div>
      <div class="inline-block float-right">
        <span>bucket容量：{{ bucketQuota }} </span>
        <span>已用容量：{{ bucketSize }} </span>
        <span>文件数量：{{ bucketObjects }} </span>
      </div>
    </div>

    <!-- 表格 -->
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column label="文件" align="center" width="140">
        <template #default="{ row }">
          <a v-if="!row.Prefix" :href="getFileUrl(row)" target="blank">
            <el-icon v-if="isImage(row)" :size="40" @click="changeDirectory(row)">
              <Picture />
            </el-icon>

            <el-icon v-else-if="isVideo(row)" :size="40" @click="changeDirectory(row)">
              <VideoPlay />
            </el-icon>

            <el-icon v-else-if="row.Prefix" :size="36" color="orange" @click="changeDirectory(row)">
              <FolderOpened />
            </el-icon>

            <el-icon v-else :size="40" @click="changeDirectory(row)">
              <Paperclip />
            </el-icon>
          </a>
          <el-icon v-if="row.Prefix" :size="36" color="orange" @click="changeDirectory(row)">
            <FolderOpened />
          </el-icon>
        </template>
      </el-table-column>
      <el-table-column label="文件名" width="330" align="left">
        <template #default="{ row }">
          <span v-if="!row.Prefix">{{ getFileName(row) }}</span>
          <span v-if="row.Prefix" class="directory-item" @click="changeDirectory(row)">
            {{ row.Prefix }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="大小" align="center" width="70">
        <template #default="{ row }">
          <span>{{ getFileSize(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="140" align="center">
        <template #default="{ row }">
          <span v-if="row.LastModified">{{ $filters.formatTime(row.LastModified) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="文件路径" align="center">
        <template #default="{ row }">
          <span> {{ row.Prefix ? '-' : row.Key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button v-if="row.Prefix" type="success" @click="changeDirectory(row)">
            查看
          </el-button>
          <a v-if="!row.Prefix" :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <el-button type="success">查看</el-button>
          </a>
          <el-button :disabled="!!row.Prefix" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogFormVisible" :title="uploadCommand === 'uploadFile' ? '上传文件' : '上传文件夹'" width="400px"
      @close="uploadFileList = []"
    >
      <el-upload
        v-if="bucketDetail.credentials" drag multiple action="" :show-file-list="true"
        :file-list="uploadFileList" :auto-upload="true" :http-request="handleUploadFile"
      >
        <el-icon :size="70">
          <UploadFilled />
        </el-icon>
        <div class="el-upload__text">
          {{ uploadCommand === 'uploadFile' ? '将文件拖到此处，或' : '' }}
          <em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 文件详情
hidden: true
meta:
  title: 文件管理
</route>
