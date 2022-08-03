<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { nextTick } from 'vue'
import { getAppAccessUrl } from '~/api/application'

import {
  createFunction,
  getAllFunctionTags,
  getFunctions,
  publishFunctions,
  removeFunction,
  updateFunction,
} from '~/api/func'
import Copy from '~/components/Copy.vue'

const $router = useRouter()

const dataFormRef = $ref<FormInstance>()

const defaultCode = `
import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('admins').get()
  console.log(r)

  return r.data
}
`

const formRules = {
  name: [
    {
      required: true,
      message: '标识不可为空，且只能含字母、数字、下划线及中划线',
      trigger: 'blur',
      pattern: /^[a-zA-Z0-9_\-]+$/,
    },
  ],
  label: [{ required: true, message: '显示名称不可为空', trigger: 'blur' }],
}

let list = $ref([])
let total = $ref(0)
let listLoading = $ref(true)
const listQuery = $ref({
  page: 1,
  limit: 10,
  keyword: undefined,
  tag: '',
  onlyEnabled: true, // 只看启用的函数
})
let form = $ref(getDefaultFormValue())
let dialogFormVisible = $ref(false)
let dialogStatus = $ref('update')
const textMap: any = $ref({ update: '编辑', create: '创建' })
const rules = reactive<FormRules>(formRules)
let all_tags = $ref([])

function handleFilter() {
  listQuery.page = 1
  getList()
}

async function getAllTags() {
  const res = await getAllFunctionTags()
  all_tags = res.data
}

/**
 * 获取数据列表
 */
async function getList() {
  listLoading = true

  const { limit, page, keyword, tag, onlyEnabled } = listQuery
  const query: {
    keyword?: string
    tag?: string
    status?: number
  } = {}
  if (keyword)
    query.keyword = keyword

  if (tag !== '')
    query.tag = tag

  if (onlyEnabled)
    query.status = 1

  const ret = await getFunctions(query, page, limit)

  total = ret.total
  list = ret.data
  listLoading = false
  getAllTags()
}

onMounted(async () => {
  await getList()
})

// 发布云函数
async function publish() {
  const confirm = await ElMessageBox.confirm('确定发布所有云函数？').catch(() => false)

  if (!confirm)
    return
  const res = await publishFunctions()
  if (res.error) {
    ElMessage(`发布失败: ${res.error}`)
    return
  }
  ElNotification({
    type: 'success',
    title: '发布成功',
    message: '云函数发布成功！',
  })
}

// 默认化创建表单的值
function getDefaultFormValue(): any {
  return {
    _id: undefined,
    name: '',
    label: '',
    description: '',
    status: 1,
    tags: [],
    enableHTTP: true,
    version: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    code: defaultCode,
    // 标签输入框绑定使用，不要提交到服务端
    _tag_input: '',
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

// 显示更新表单
function showUpdateForm(row: any) {
  form = Object.assign(getDefaultFormValue(), row) // copy obj
  dialogStatus = 'update'
  dialogFormVisible = true
  nextTick(() => {
    dataFormRef.clearValidate()
  })
}

function getFunctionInvokeBaseUrl(func_name: string) {
  const app_url = getAppAccessUrl()
  return `${app_url}/${func_name}`
}

// 查看详情
async function handleShowDetail(row: { _id: any }) {
  $router.push({
    name: 'debug',
    params: {
      id: row._id,
    },
  })
}

// 删除标签
function removeTag(index: number) {
  const tags = form.tags || []
  if (!tags.length)
    return
  tags.splice(index, 1)
}

// 添加标签
function addTag() {
  const val: any = form._tag_input

  if (!val)
    return
  if (!form.tags.includes(val))
    form.tags.push(val)

  form._tag_input = ''
}

// 查看日志详情
async function handleShowLogs(row: { _id: any }) {
  $router.push({
    name: '日志详情',
    params: {
      id: row._id,
    },
  })
}

// 设置触发器
async function handleTriggers(row: { _id: any }) {
  $router.push({
    name: 'trigger',
    params: {
      funcId: row._id,
    },
  })
}

// 搜索建议标签
async function suggestTags(queryString: any, cb: (arg0: { value: never }[]) => void) {
  const data = all_tags
    .filter((it: any) => {
      return it.includes(queryString)
    })
    .map((it) => {
      return { value: it }
    })

  cb(data)
}

// 删除请求
async function handleDelete(row: { status: any; _id: any }, index: number) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  if (row.status)
    return ElMessageBox.alert('请先停用函数，再删除！')

  // 执行删除请求
  const r = await removeFunction(row._id)

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

// 创建请求
function handleCreate() {
  dataFormRef.validate(async (valid: any) => {
    if (!valid)
      return

    const data: any = Object.assign({}, form)
    delete data._tag_input
    // 执行创建请求
    const res = await createFunction(data)
    if (!res.data?.insertedId) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: `创建失败！${res.error}`,
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

// 更新请求
function handleUpdate() {
  dataFormRef.validate(async (valid: any) => {
    if (!valid)
      return

    // 执行创建请求
    const r = await updateFunction(form._id, {
      name: form.name,
      label: form.label,
      tags: form.tags || [],
      description: form.description,
      enableHTTP: form.enableHTTP ?? true,
      status: form.status ?? 1,
      updated_at: Date.now(),
    })

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
</script>

<template>
  <div class="app-container bg-white">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-input
        v-model="listQuery.keyword" placeholder="搜索" style="width: 200px; margin-right: 10px"
        class="filter-item" @keyup.enter="handleFilter"
      />
      <el-button class="filter-item" type="default" icon="Search" @click="handleFilter">
        搜索
      </el-button>

      <el-button type="primary" icon="Plus" class="filter-item" @click="showCreateForm">
        新建函数
      </el-button>
      <el-tooltip content="发布函数：函数要发布后才能生效" placement="bottom" effect="light">
        <el-button class="filter-item" type="success" icon="Guide" @click="publish">
          发布函数
        </el-button>
      </el-tooltip>
      <el-checkbox
        v-model="listQuery.onlyEnabled" class="filter-item ml-12px vertical-mid" label=""
        :indeterminate="false" @change="handleFilter"
      >
        只看已启用
      </el-checkbox>
    </div>

    <!-- 标签类别 -->

    <div class="tag-selector flex items-center mb-24px">
      <div class="label mr-12px text-xs">
        标签类别
      </div>
      <el-radio-group v-model="listQuery.tag" size="small" @change="getList">
        <el-radio-button label="">
          全部
        </el-radio-button>
        <el-radio-button v-for="tag in all_tags" :key="tag" :label="tag">
          {{ tag }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 表格 -->
    <el-table v-loading="listLoading" border :data="list" highlight-current-row style="width: 100%">
      <el-table-column label="函数标识" min-width="200">
        <template #default="{ row }">
          <a class="link-type" style="font-size: 13px; font-weight: bold" @click="showUpdateForm(row)">{{ row.label
          }}</a>
          <div style="display: flex; align-items: center; justify-content: flex-start">
            <div class="func-name mr-4px">
              {{ row.name }}
            </div>
            <Copy :text="row.name" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="80">
        <template #default="{ row }">
          <el-tag v-for="tag in row.tags" :key="tag" style="margin-right: 6px" type="success" size="small">
            {{ tag }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建/更新" width="200" align="center">
        <template #default="{ row }">
          <span v-if="row.created_at">{{ $filters.formatTime(row.created_at) }}</span>
          <span v-else>-</span>
          <br>
          <span v-if="row.updated_at">{{ $filters.formatTime(row.updated_at) }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="HTTP" class-name="status-col" min-width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.enableHTTP" type="success" size="small" style="font-weight: bold">
            可
          </el-tag>
          <el-tag v-else type="info" size="small" style="font-weight: bold">
            不
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="60" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success" size="small" style="font-weight: bold">
            启
          </el-tag>
          <el-tag v-if="row.status === 0" type="warning" size="small" style="font-weight: bold">
            停
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="调用地址" align="center" min-width="70">
        <template #default="{ row }">
          <el-tooltip :content="getFunctionInvokeBaseUrl(row.name)" placement="top">
            <Copy :text="getFunctionInvokeBaseUrl(row.name)" />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="240" class-name="small-padding">
        <template #default="{ row, $index }">
          <el-button type="success" size="small" @click="handleShowDetail(row)">
            开发
          </el-button>
          <el-button type="info" size="small" @click="handleShowLogs(row)">
            日志
          </el-button>
          <el-button type="primary" size="small" @click="handleTriggers(row)">
            触发器<b v-if="row.triggers && row.triggers.length">({{ row.triggers.length }})</b>
          </el-button>
          <el-tooltip content="请先停用函数，再删除！" :disabled="row.status !== 1" placement="top">
            <el-button
              v-if="row.status !== 'deleted'" icon="Delete" size="small" type="danger" circle
              @click="handleDelete(row, $index)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:currentPage="listQuery.page" class="mt-24px" :page-size="listQuery.limit" background
      layout="->, total, prev, pager, next" :total="total" @size-change="getList" @current-change="getList"
    />

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogFormVisible" :title="textMap[dialogStatus]" width="600px">
      <el-form
        ref="dataFormRef" :rules="rules" :model="form" label-position="left" label-width="120px"
        style="width: 500px; margin-left: 20px"
      >
        <el-form-item v-if="form._id" label="ID" prop="_id">
          <div :value="form._id">
            {{ form._id }}
          </div>
        </el-form-item>
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="form.label" placeholder="函数显示名，可为中文" />
        </el-form-item>
        <el-form-item label="函数标识" prop="name">
          <el-input v-model="form.name" placeholder="函数的唯一标识，如 get-user" />
        </el-form-item>
        <el-form-item label="HTTP访问" prop="enableHTTP">
          <el-switch v-model="form.enableHTTP" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <el-form-item label="标签分类" prop="tags">
          <el-tag
            v-for="(tag, index) in form.tags" :key="tag" style="margin-right: 10px" type="" size="medium" closable
            @close="removeTag(index)"
          >
            {{ tag }}
          </el-tag>
          <el-autocomplete
            v-model="form._tag_input" :fetch-suggestions="suggestTags" class="input-new-tag" clearable
            type="text" placeholder="添加" @select="addTag" @change="addTag"
          />
        </el-form-item>
        <el-form-item label="启用" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="函数描述">
          <el-input
            v-model="form.description" :autosize="{ minRows: 3, maxRows: 6 }" type="textarea"
            placeholder="函数描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? handleCreate() : handleUpdate()">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
</style>

<route lang="yaml">
name: 云函数
meta:
  title: 云函数
  icon: cloud-function
  index: 1-0
</route>
