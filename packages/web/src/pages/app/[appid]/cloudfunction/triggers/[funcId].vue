<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { ElMessageBox, ElNotification } from 'element-plus'

import { createTrigger, removeTrigger, updateTrigger } from '~/api/trigger'
import { getFunctionById } from '~/api/func'

const router = useRouter()
const route = useRoute()

const funcId: any = route.params?.funcId || ''

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: null,
    name: '',
    type: 'event',
    event: '',
    duration: 60,
    desc: '',
    status: 1,
    created_at: Date.now(),
    updated_at: Date.now(),
  }
}

const formRules = {
  name: [{ required: true, message: '触发器名不可为空', trigger: 'blur' }],
  type: [{ required: true, message: '请选择触发器类型', trigger: 'blur' }],
  event: [{ required: true, message: '请填写触发器事件', trigger: 'blur' }],
  duration: [{ required: true, message: '请填写定时器间隔', trigger: 'blur' }, { type: 'number', message: '间隔必须为数字' }],
}

const dataFormRef = $ref<FormInstance>()

let loading = $ref(false)
let func: any = $ref(null)
let form: any = $ref(getDefaultFormValue())
let list: any = $ref(null)
let dialogFormVisible = $ref(false)
let dialogStatus = $ref('')
const textMap: any = $ref({ update: '编辑', create: '创建' })
const rules = $ref(formRules)

async function getFunction() {
  const func_id = funcId
  loading = true
  const r = await getFunctionById(func_id)

  if (r.error) {
    ElNotification({
      type: 'error',
      title: '错误',
      message: `加载函数失败：${r.error}`,
    })
    return
  }

  func = r.data
  list = r.data?.triggers || []
  loading = false
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

    const params: any = { ...form }

    if (params.type === 'event')
      params.duration = undefined

    if (params.type === 'timer')
      params.event = undefined

    // 执行创建请求
    const r = await createTrigger(funcId, params)

    if (r.error) {
      ElNotification({
        type: 'error',
        message: `创建失败！${r.error}`,
      })
      return
    }

    ElNotification({
      type: 'success',
      message: '创建成功！',
    })

    getFunction()
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
  dataFormRef.validate(async (valid: any) => {
    if (!valid)
      return

    const r = await updateTrigger(funcId, form._id, {
      name: form.name,
      event: form.type === 'event' ? form.event : undefined,
      duration: form.type === 'timer' ? form.duration : undefined,
      desc: form.desc,
      status: form.status,
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

    getFunction()
    dialogFormVisible = false
  })
}

async function handleDelete(row: any, index: number) {
  if (row.status === 1) {
    ElNotification({
      type: 'error',
      title: '不可删除',
      message: '请先将触发器停用后再删除',
    })
    return
  }
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  // 执行删除请求
  const r = await removeTrigger(funcId, row._id)

  if (r.error) {
    ElNotification({
      type: 'error',
      message: `删除失败！${r.error}`,
    })
    return
  }

  ElNotification({
    type: 'success',
    message: '删除成功！',
  })

  list.splice(index, 1)
}

function showTriggerLogs(row: any) {
  router.push({ path: `../logs?trigger_id=${row._id}` })
}

function setTagViewTitle() {
  const label = func.label
  const title = route.meta.title
  const _route = Object.assign({}, route, { title: `${title}: ${label}` })
  // TODO
  // $store.dispatch('tagsView/updateVisitedView', route)
}

onMounted(async () => {
  await getFunction()
  setTagViewTitle()
})
</script>

<template>
  <div class="app-container">
    <div v-if="func" class="func-title">
      <h3>
        触发函数: {{ func.label }}
        <el-tag type="success">
          {{ func.name }}
        </el-tag>
      </h3>
    </div>
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-button
        class="filter-item"
        type="default"
        icon="Refresh"
        @click="getFunction"
      >
        刷新
      </el-button>
      <el-button
        class="filter-item"
        type="primary"
        icon="Plus"
        @click="showCreateForm"
      >
        新建触发器
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column label="ID" prop="_id" align="center" width="220">
        <template #default="{ row }">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="200">
        <template #default="{ row }">
          <span class="link-type" @click="showUpdateForm(row)">{{
            row.name
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.type === 'event'" type="primary">
            事件
          </el-tag>
          <el-tag v-if="row.type === 'timer'" type="success">
            定时器
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="间隔/事件" align="center" width="100">
        <template #default="{ row }">
          <span v-if="row.type === 'event'">{{ row.event }}</span>
          <span v-if="row.type === 'timer'">{{ row.duration }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建/更新" width="180" align="center">
        <template #default="{ row }">
          <span v-if="row.created_at">{{
            $filters.formatTime(row.created_at, 'YYYY-MM-DD HH:mm')
          }}</span><br>
          <span v-if="row.updated_at">{{
            $filters.formatTime(row.updated_at, 'YYYY-MM-DD HH:mm')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="80">
        <template #default="{ row }">
          <el-tag v-if="row.status === 0" type="danger">
            停用
          </el-tag>
          <el-tag v-if="row.status === 1" type="success">
            启用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        align="center"
        width="240"
        class-name="small-padding fixed-width"
      >
        <template #default="{ row, $index }">
          <el-button type="info" @click="showTriggerLogs(row)">
            日志
          </el-button>
          <el-button type="primary" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button
            v-if="row.status !== 'deleted'"

            type="danger"
            @click="handleDelete(row, $index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog
      v-model="dialogFormVisible"
      :title="textMap[dialogStatus]"
    >
      <el-form
        ref="dataFormRef"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left: 0"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="触发器名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select
            v-model="form.type"
            placeholder="触发器类型"
            :disabled="!!form._id"
          >
            <el-option label="事件" value="event" />
            <el-option label="定时器" value="timer" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'event'" label="事件" prop="event">
          <el-input v-model="form.event" placeholder="触发器事件" />
        </el-form-item>
        <el-form-item v-if="form.type === 'timer'" label="间隔" prop="duration">
          <el-input
            v-model.number="form.duration"
            min="1"
            type="number"
            placeholder="触发器间隔(秒）"
          />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            :autosize="{ minRows: 3, maxRows: 6 }"
            type="textarea"
            placeholder="触发器描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button
            type="primary"
            @click="dialogStatus === 'create' ? handleCreate() : handleUpdate()"
          >
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: trigger
hidden: true
meta:
  title: 触发器详情
  icon: cloud-function
</route>
