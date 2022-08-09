<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'
import { ElNotification } from 'element-plus'
import type { ReactiveVariable } from 'vue/macros'
import * as oss from '~/api/oss'
import { assert } from '~/utils/assert'
import { useAppStore } from '~/store'
import Copy from '~/components/Copy.vue'

const $router = useRouter()

const MODE = {
  PRIVATE: 'private',
  PUBLIC_READ: 'public-read',
  PUBLIC_READ_WRITE: 'public-read-write',
}

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: '',
    mode: MODE.PRIVATE,
    quota: 1,
  }
}

const dataFormRef = $ref<FormInstance>()

// 表单验证规则
const formRules = {
  name: [{ required: true, message: 'Bucket 名字不可为空', trigger: 'blur' }],
  mode: [{ required: true, message: 'Bucket 权限为必选', trigger: 'blur' }],
  quota: [{ required: true, message: 'Bucket 容量为必选', trigger: 'blur' }],
}

const tableKey = $ref(0)
let list = $ref([])
let listLoading = $ref(true)
let form = $ref(getDefaultFormValue())
const rules = reactive<FormRules>(formRules)
let dialogFormVisible = $ref(false)
let dialogACFormVisible = $ref(false)
let acLoading = $ref(false)
let access_key = $ref('')
let access_secret = $ref('')
let dialogStatus = $ref('')
const textMap: any = $ref({ update: '编辑', create: '创建' })
let freeQuota = $ref(0)
const mode = $ref(MODE)

const appStore = useAppStore()

const app = appStore.currentApp

const totalQuota = $computed(() => {
  const spec = appStore.spec

  const _totalQuota = (spec.spec as any).storage_capacity || 0
  return byte2gb(_totalQuota)
})

const oss_external_endpoint = $computed(() => {
  return appStore.ossExternalEndpoint.toString()
})

function byte2gb(byte: number) {
  return Math.floor(byte / 1024 / 1024 / 1024)
}

function gb2byte(gb: number) {
  return gb * 1024 * 1024 * 1024
}

async function getList() {
  listLoading = true

  // 执行数据查询
  const ret = await oss.getBuckets().catch(() => {
    listLoading = false
  })
  assert(ret.code === 0, 'get file buckets got error')

  const usedQuota = ret.data.reduce((total: any, bucket: { quota: any }) => {
    return total + bucket.quota
  }, 0)
  freeQuota = totalQuota - byte2gb(usedQuota)

  list = ret.data
  listLoading = false
}

function showCreateForm() {
  form = getDefaultFormValue()
  dialogStatus = 'create'
  dialogFormVisible = true
  nextTick(() => {
    dataFormRef.clearValidate()
  })
}

function handleCreate() {
  dataFormRef.validate(async (valid) => {
    if (!valid)
      return

    const isNameValid = /^[a-z0-9]{3,16}$/g.test(form.name)
    if (!isNameValid) {
      return ElMessage.error(
        'Bucket 名称长度必须在 3～16 之间，且只能包含小写字母、数字',
      )
    }

    if (freeQuota < form.quota)
      return ElMessage.error('所有Bucket容量相加不能超过总容量')

    const quota = gb2byte(form.quota)
    // 执行创建请求
    const r: any = await oss.createBucket(form.name, form.mode, quota)

    if (r.code) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: r.error,
      })
      return
    }

    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '创建成功！',
    })

    getList()
    dialogFormVisible = false
  })
}

function showEditForm(row: ReactiveVariable<{ name: string; mode: string; quota: number }>) {
  form = { ...row, quota: byte2gb(row.quota) }
  dialogStatus = 'update'
  dialogFormVisible = true
  nextTick(() => {
    dataFormRef.clearValidate()
  })
}

function handleUpdate() {
  dataFormRef.validate(async (valid) => {
    if (!valid)
      return

    // 检查quota是否可用
    const existedQuota = (((list || []).find(
      (bucket: { name: string }) => bucket.name === form.name,
    ) || {}) as any).quota
    freeQuota = toRaw(freeQuota) + byte2gb(existedQuota)
    if (freeQuota < form.quota)
      return ElMessage.error('所有Bucket容量相加不能超过总容量')

    const quota = gb2byte(form.quota)

    // 执行更新请求
    const r = await oss.updateBucket(form.name, form.mode, quota)

    if (r.code) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: r.error,
      })
      return
    }

    ElMessage.success('更新成功')

    getList()
    dialogFormVisible = false
  })
}

async function handleDelete(row: { name: any }, index: any) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  // 执行删除请求
  const r = await oss.deleteBucket(row.name)

  if (r.code === 'BUCKET_NOT_EMPTY')
    return ElMessage.error('不可删除非空文件桶')

  if (r.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: `删除失败:${r.error}`,
    })
    return
  }

  ElMessage.success('删除成功！')

  getList()
}

function getBucketUrl(bucketName: any) {
  return oss.getBucketSecondaryUrl(bucketName)
}

async function handleShowDetail(row: { name: any }) {
  // 跳转到详情页
  $router.push(`./files/${row.name}`)
}

async function handleUpdateAC() {
  await ElMessageBox.confirm(
    '服务账号重置以后，之前的服务账号会失效，确定重置？',
    '服务账号重置',
    {
      confirmButtonText: '重置',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )

  acLoading = true

  const ret = await oss.updateAC()

  if (ret.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: ret.error,
    })
  }
  acLoading = false
  dialogACFormVisible = true
  access_key = ret.data.access_key
  access_secret = ret.data.access_secret
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-button class="filter-item inline-block" type="default" icon="Search" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item inline-block" type="primary" icon="Plus" @click="showCreateForm">
        新建文件桶(Bucket)
      </el-button>

      <el-button class="filter-item inline-block" type="primary" :loading="acLoading" @click="handleUpdateAC()">
        获取服务账号
      </el-button>

      <el-tooltip :content="oss_external_endpoint" placement="top">
        <el-tag type="info" class="ml-12px">
          OSS EndPoint
          <Copy :text="oss_external_endpoint" />
        </el-tag>
      </el-tooltip>
    </div>

    <!-- 表格 -->
    <el-table :key="tableKey" v-loading="listLoading" :data="list" fit highlight-current-row style="width: 100%">
      <el-table-column label="文件桶(Bucket)" width="200">
        <template #default="{ row }">
          <span>{{ app.appid }}-{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="容量(Quota)" width="200">
        <template #default="{ row }">
          <span>{{ byte2gb(row.quota) }} GB</span>
        </template>
      </el-table-column>
      <el-table-column label="默认权限" align="center" width="100">
        <template #default="{ row }">
          <span v-if="row.mode === mode.PRIVATE">
            <el-tag type="info" size="small" effect="plain">私有</el-tag>
          </span>
          <span v-if="row.mode === mode.PUBLIC_READ">
            <el-tag type="success" size="small" effect="plain">公共读</el-tag>
          </span>
          <span v-if="row.mode === mode.PUBLIC_READ_WRITE">
            <el-tag type="danger" size="small" effect="plain">公共读写</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Bucket URL">
        <template #default="{ row }">
          <span>{{ getBucketUrl(row.name) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding" width="260">
        <template #default="{ row, $index }">
          <el-button plain size="small" type="primary" @click="handleShowDetail(row)">
            管理文件
          </el-button>
          <el-button plain size="small" type="success" @click="showEditForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status !== 'deleted'" plain size="small" type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogFormVisible" width="600px" :title="textMap[dialogStatus]">
      <el-form
        ref="dataFormRef" :rules="rules" :model="form" label-width="100px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="文件桶名" prop="name">
          <el-input v-model="form.name" :disabled="dialogStatus === 'update'" placeholder="唯一标识">
            <template #prepend>
              {{ app.appid }}-
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="默认权限" prop="mode">
          <el-select v-model="form.mode" placeholder="">
            <el-option label="私有" :value="mode.PRIVATE" />
            <el-option label="公共读" :value="mode.PUBLIC_READ" />
            <el-option label="公共读写" :value="mode.PUBLIC_READ_WRITE" />
          </el-select>
        </el-form-item>
        <el-form-item label="容量" prop="quota">
          <el-input
            v-model.number="form.quota" type="number" :step="1" :min="1"
            oninput="value=value.replace(/[^0-9]/g,'')" style="width: 140px" placeholder="容量，单位：GB"
          >
            <template #append>
              GB
            </template>
          </el-input>
          <span class="ml-12px"> 总容量 {{ totalQuota }} GB，剩余 {{ freeQuota }} GB</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? handleCreate() : handleUpdate()">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="dialogACFormVisible" width="800px" title="服务账号">
      <el-form label-width="120px" style="width: 600px; margin-left: 50px">
        <el-alert title="服务账号只会显示一次，请自行保存" type="error" :closable="false" />
        <br>
        <el-form-item label="Access Key">
          <div>
            {{ access_key }}
            <Copy :text="access_key" />
          </div>
        </el-form-item>

        <el-form-item label="Access Secret">
          <div>
            {{ access_secret }}
            <Copy :text="access_secret" />
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 文件管理
meta:
  title: 文件管理
  index: 3-0 # menu sort by index
</route>
