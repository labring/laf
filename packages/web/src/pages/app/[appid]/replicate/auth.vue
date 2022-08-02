<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { ElMessageBox, ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import { acceptReplicateAuth, createReplicateAuth, createReplicateRequest, deleteReplicateAuth, getReplicateAuths } from '~/api/replicate'
import { useAppStore } from '~/store'

const createForm = $ref<FormInstance>()

const appStore = useAppStore()
const appid = appStore.currentApp.appid

let list = $ref([])
let tableList = $ref([])
let listLoading = $ref(true)
const form = $ref({ target_appid: '' })
const rules = $ref({ target_appid: [{ required: true, message: '请输入目标应用appid', trigger: 'blur' }] })
let dialogFormVisible = $ref(false)
let authType = $ref('target')
let replicasDialogVisible = $ref(false)
const replicasForm: any = $ref({ target_appid: '', permissions: [] })

function handleSwitchType({ name }: { name: string }) {
  authType = name
  switchList()
}

function switchList() {
  if (authType === 'target')
    tableList = list.filter((item: any) => item.source_appid === appid)

  else
    tableList = list.filter((item: any) => item.target_appid === appid)
}

function showReplicasForm(row: any) {
  replicasForm.target_appid = row.target_appid
  replicasDialogVisible = true
}

async function handleCreateRequest() {
  createForm.validate(async (valid) => {
    if (!valid)
      return

    if (replicasForm.permissions.length === 0) {
      ElMessage.warning('请至少选择一个部署权限')
      return
    }

    const params: any = {
      target_appid: replicasForm.target_appid,
    }
    if (replicasForm.permissions.includes('function')) {
      params.functions = {
        type: 'all',
        items: [],
      }
    }
    if (replicasForm.permissions.includes('policy')) {
      params.policies = {
        type: 'all',
        items: [],
      }
    }

    const res = await createReplicateRequest(params)

    if (res.code) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: res.message,
      })
      return
    }

    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '部署成功，等待目标应用接受。',
    })

    replicasDialogVisible = false
  })
}

function showCreateForm() {
  dialogFormVisible = true
}

async function fetchReplicateAuths() {
  listLoading = true

  const res = await getReplicateAuths()
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  list = res.data.map((item: any) => {
    item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
    if (item.updated_at)
      item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
    return item
  })
  switchList()
  listLoading = false
}

async function handleCreateAuth() {
  createForm.validate(async (valid) => {
    if (!valid)
      return

    const res = await createReplicateAuth(form.target_appid)

    if (res.code) {
      ElNotification({
        type: 'error',
        title: '操作失败',
        message: res.message,
      })
      return
    }

    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '创建成功！',
    })

    fetchReplicateAuths()
    dialogFormVisible = false
  })
}

async function handleUpdateAuth(auth: any) {
  await ElMessageBox.confirm('是否接受此授权？', '授权确认')

  const res = await acceptReplicateAuth(auth._id)
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  fetchReplicateAuths()
}

async function handleDeleteAuth(auth: any) {
  await ElMessageBox.confirm('确认要删除此授权？', '删除确认')

  const res = await deleteReplicateAuth(auth._id)
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  fetchReplicateAuths()
}

onMounted(async () => {
  await fetchReplicateAuths()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="mb-24px">
      <el-button
        plain
        size="mini"
        class="filter-item"
        type="primary"
        icon="Plus"
        @click="showCreateForm"
      >
        新增授权
      </el-button>
    </div>

    <el-tabs
      v-model="authType"
      class="mb-12px"
      type="card"
      @tab-click="handleSwitchType"
    >
      <el-tab-pane label="目标应用" name="target" />
      <el-tab-pane label="授权请求" name="source" />
    </el-tabs>

    <!-- 数据列表 -->
    <el-table
      :data="tableList"
      :loading="listLoading"
      border
      style="width: 100%; top: -15px"
    >
      <el-table-column
        prop="source_appid"
        label="源应用"
        width="180"
        align="center"
      />
      <el-table-column prop="target_appid" label="目标应用" align="center" />
      <el-table-column
        prop="created_at"
        label="创建时间"
        width="180"
        align="center"
      />
      <el-table-column
        prop="updated_at"
        label="更新时间"
        width="180"
        align="center"
      />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag
            :type="scope.row.status === 'accepted' ? 'success' : 'warning'"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button
            v-if="authType === 'target' && scope.row.status === 'accepted'"
            plain
            size="mini"
            class="filter-item"
            type="primary"
            @click="showReplicasForm(scope.row)"
          >
            部署
          </el-button>
          <el-button
            v-if="authType === 'source' && scope.row.status !== 'accepted'"
            size="mini"
            plain
            type="primary"
            @click="handleUpdateAuth(scope.row)"
          >
            接受
          </el-button>
          <el-button
            size="mini"
            plain
            type="danger"
            @click="handleDeleteAuth(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogFormVisible" title="请求授权">
      <el-form
        ref="createForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 20px"
      >
        <el-form-item label="目标appid" prop="target_appid">
          <el-input v-model="form.target_appid" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleCreateAuth">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="replicasDialogVisible" title="请求部署">
      <el-form
        ref="createForm"
        :rules="rules"
        :model="replicasForm"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left: 20px"
      >
        <el-form-item label="目标 appid" prop="target_appid">
          <el-input v-model="replicasForm.target_appid" disabled />
        </el-form-item>
        <el-form-item label="部署权限" prop="permissions">
          <el-checkbox-group v-model="replicasForm.permissions">
            <el-checkbox label="function" border>
              云函数
            </el-checkbox>
            <el-checkbox label="policy" border>
              访问策略
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="replicasDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleCreateRequest">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 部署授权
meta:
  title: 部署授权
  index: 4-0
</route>

