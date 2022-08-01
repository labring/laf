<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { ElMessageBox, ElNotification } from 'element-plus'
import { getFunctions } from '~/api/func'
import { createPolicy, getPolicies, publishPolicies, removePolicy, updatePolicy } from '~/api/policy'

const router = useRouter()

function statusFilter(status: 0 | 1) {
  status = status ?? 0
  // 状态映射表
  const statusMap = {
    0: '停用',
    1: '启用',
  }
  return statusMap[status]
}

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    name: '',
    description: '',
    injector: null,
    rules: {},
    status: 1,
    created_at: Date.now(),
    updated_at: Date.now(),
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '标识不可为空', trigger: 'blur' }],
  label: [{ required: true, message: '标题不可为空', trigger: 'blur' }],
}

const dataFormRef = $ref<FormInstance>()

const tableKey = $ref(0)
let list: any = $ref(null)
let total = $ref(0)
let listLoading = $ref(true)
let form: any = $ref(getDefaultFormValue())
const listQuery = $ref({ page: 1, limit: 20, keyword: undefined })
let dialogFormVisible = $ref(false)
let dialogStatus = $ref('')
const textMap: any = $ref({ update: '编辑', create: '创建' })
const rules = $ref(formRules)
let functions: any = $ref([])

async function fetchFunctions() {
  // get all functions
  const r = await getFunctions({ status: 1 }, 1, 9999)
  functions = r.data ?? []
}

async function getList() {
  listLoading = true

  // 拼装查询条件 by listQuery
  const { limit, page, keyword } = listQuery
  const query: any = {}
  if (keyword)
    query.keyword = keyword

  // 执行数据查询
  const res = await getPolicies(query, page, limit)
  list = res.data

  total = res.total
  listLoading = false
}

function handleFilter() {
  listQuery.page = 1
  getList()
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

    // 执行创建请求
    const r = await createPolicy(form)

    if (r.error) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: `创建失败！${r.error}`,
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

function showUpdateForm(row: any) {
  form = Object.assign({}, row) // copy obj
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

    // 构建更新数据对象
    const data = {
      name: form.name,
      label: form.label,
      injector: form.injector,
      status: form.status,
      description: form.description,
    }

    // 执行更新请求
    const r = await updatePolicy(form._id, data)

    if (r.error) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: `更新失败！${r.error}`,
      })
      return
    }

    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '更新成功！',
    })

    getList()
    dialogFormVisible = false
  })
}

async function handleDelete(row: { _id: any }, index: any) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  // 执行删除请求
  const r = await removePolicy(row._id)

  if (r.error) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: `删除失败！${r.error}`,
    })
    return
  }

  ElNotification({
    type: 'success',
    title: '操作成功',
    message: '删除成功！',
  })

  list.splice(index, 1)
}

async function publish() {
  const confirm = await ElMessageBox.confirm('确定发布所有规则？').catch(
    () => false,
  )

  if (!confirm)
    return
  const res = await publishPolicies()
  if (res.error) {
    ElMessage.success(`发布失败: ${res.error}`)
    return
  }
  ElNotification({
    type: 'success',
    title: '发布成功',
    message: '访问策略发布成功！',
  })
}

async function handleShowDetail(row: { _id: any }) {
  router.push(`${row._id}`)
}

onMounted(() => {
  fetchFunctions()
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-input
        v-model="listQuery.keyword" placeholder="搜索" style="width: 200px; margin-right: 10px"
        class="filter-item" @keyup.enter="handleFilter"
      />
      <el-button class="filter-item" type="default" icon="Search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="Plus" @click="showCreateForm">
        新建
      </el-button>
      <el-tooltip content="发布策略：策略修改后需要发布才能生效" placement="bottom" effect="light">
        <el-button class="filter-item" type="success" icon="Guide" @click="publish">
          发布策略
        </el-button>
      </el-tooltip>
    </div>

    <!-- 表格 -->
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <!-- <el-table-column label="ID" prop="id" align="center" width="220">
          <template slot-scope="{row}">
            <span>{{ row._id }}</span>
          </template>
        </el-table-column> -->
      <el-table-column label="标识" align="center" width="160px">
        <template #default="{ row }">
          <span class="link-type" @click="showUpdateForm(row)">{{
            row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入口地址" align="left" width="150px">
        <template #default="{ row }">
          <span>/proxy/{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template #default="{ row }">
          <span v-if="row.description">{{ row.description }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template #default="{ row }">
          <span v-if="row.created_at">{{
            $filters.formatTime(row.created_at)
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template #default="{ row }">
          <span v-if="row.updated_at">{{
            $filters.parseTime(row.updated_at, '{y}-{m}-{d} {h}:{i}')
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="80">
        <template #default="{ row }">
          <el-tag type="success">
            {{ statusFilter(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="260" class-name="small-padding fixed-width">
        <template #default="{ row, $index }">
          <el-button type="primary"  @click="handleShowDetail(row)">
            编辑
          </el-button>
          <el-button v-if="row.status !== 'deleted'"  type="danger" @click="handleDelete(row, $index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:currentPage="listQuery.page" class="mt-24px" :page-size="listQuery.limit" background
      layout="->, total, prev, pager, next" :total="total" @size-change="getList" @current-change="getList"
    />

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]">
      <el-form
        ref="dataFormRef" :rules="rules" :model="form" label-position="left" label-width="70px"
        style="width: 500px; margin-left: 50px"
      >
        <el-form-item label="标识" prop="name">
          <el-input v-model="form.name" placeholder="唯一标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="form.description" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea"
            placeholder="描述"
          />
        </el-form-item>
        <el-form-item label="injector">
          <el-select v-model="form.injector" placeholder="选择云函数做为injector">
            <el-option label="无" :value="null" />
            <el-option v-for="item in functions" :key="item._id" :label="item.label" :value="item.name" />
          </el-select>
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
name: policies
meta:
  title: 策略管理
  index: 2-1
</route>
