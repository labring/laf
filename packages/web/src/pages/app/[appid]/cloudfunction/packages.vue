<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { addApplicationPackage, getApplicationPackages, removeApplicationPackage, restartApplicationInstance, updateApplicationPackage } from '~/api/application'
import { useAppStore } from '~/store'

const appStore = useAppStore()

const app: { appid: string } = appStore.currentApp

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '依赖包名不可为空', trigger: 'blur' }],
  version: [{ required: false, message: '', trigger: 'blur' }],
}

const dataFormRef = $ref<FormInstance>()

let list = $ref(null)
let listLoading = $ref(true)
let dialogFormVisible = $ref(false)
let dialogStatus = $ref('')
let form = $ref(getDefaultFormValue())
const textMap: any = $ref({ update: '编辑', create: '添加' })
const rules = $ref(formRules)

// 获取数据列表
async function getList() {
  listLoading = true
  const res = await getApplicationPackages(app.appid)
  list = res.data
  listLoading = false
}

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: '',
    version: '',
  }
}

// 显示创建表单
function showCreateForm() {
  form = getDefaultFormValue()
  dialogStatus = 'create'
  dialogFormVisible = true
  nextTick(() => {
    dataFormRef.clearValidate()
  })
}

// 创建请求
function handleCreate() {
  dataFormRef.validate(async (valid) => {
    if (!valid)
      return

    const name = form.name
    const version = form.version || 'latest'

    const r = await addApplicationPackage(app.appid, { name, version })
    if (r.error) {
      console.error(r.error)
      return ElMessage.error(`操作失败: ${r.error}`)
    }

    ElMessage.success('操作成功')
    getList()
    dialogFormVisible = false
  })
}

// 显示更新表单
function showUpdateForm(row: any) {
  form = Object.assign({}, row) // copy obj
  dialogStatus = 'update'
  dialogFormVisible = true
  nextTick(() => {
    dataFormRef.clearValidate()
  })
}

// 重启服务
async function restartApp() {
  await ElMessageBox.confirm('确认要重启应用服务？', '服务操作确认')
  listLoading = true
  await restartApplicationInstance(app.appid)

  listLoading = false
  ElMessage.success('操作成功')
}

function handleUpdate() {
  dataFormRef.validate(async (valid) => {
    if (!valid)
      return

    // 构建更新数据对象
    const data = {
      name: form.name,
      version: form.version,
    }

    // 执行更新请求
    const r = await updateApplicationPackage(app.appid, data)
    if (r.error)
      return ElMessage.error(`更新失败: ${r.error}`)

    ElMessage.success('更新成功！')
    getList()
    dialogFormVisible = false
  })
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  const r = await removeApplicationPackage(app.appid, row.name)
  if (r.error)
    return ElMessage.error(`删除失败: ${r.error}`)

  ElMessage.success('删除成功！')
  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-button class="filter-item" type="default" icon="Refresh" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item" type="primary" icon="Plus" @click="showCreateForm">
        添加
      </el-button>
      <el-button class="filter-item" type="default" @click="restartApp">
        重启服务
      </el-button>
      <span style="margin-left: 20px; font-size: 14px; color: blue">（依赖变更后，需要重启服务才能生效！）</span>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading" :data="list" border fit highlight-current-row style="max-width: 600px"
      size="medium"
    >
      <el-table-column label="名称" width="240">
        <template #default="{ row }">
          <span class="link-type" @click="showUpdateForm(row)">{{
            row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="版本" width="140" align="center">
        <template #default="{ row }">
          <span>{{ row.version }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="success" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status !== 'deleted'" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]">
      <el-form
        ref="dataFormRef" :rules="rules" :model="form" label-position="left" label-width="140px"
        style="width: 400px; margin-left: 50px"
      >
        <el-form-item label="依赖包名" prop="name">
          <el-input
            v-model="form.name" :disabled="dialogStatus !== 'create'" placeholder="请输入依赖包名"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item label="依赖版本" prop="version">
          <el-input v-model="form.version" placeholder="latest" style="width: 400px" />
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
  </div>
</template>

<route lang="yaml">
name: 依赖管理
meta:
  title: 云函数依赖
  index: 1-1
</route>
