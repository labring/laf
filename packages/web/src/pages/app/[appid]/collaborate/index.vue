<script setup lang="ts">
import {
  getAllApplicationRoles,
  getCollaborators,
  inviteCollaborator,
  removeCollaborator,
  searchUserByUsername,
} from '~/api/application'
import { useAppStore } from '~/store'

const defaultForm: any = {
  uid: undefined,
  username: '',
  user: {},
  roles: [],
}

const appStore = useAppStore()

const app = appStore.currentApp

let form = $ref(Object.assign({}, defaultForm))
let collaborators = $ref([])
let dialogVisible = $ref(false)
let dialogType = $ref('new')
let roles: any = $ref([])
let loading = $ref(false)

async function getRoles() {
  loading = true
  const res = await getAllApplicationRoles().finally(() => {
    loading = false
  })

  roles = res.data
}

async function loadCollaborators() {
  loading = true
  const res = await getCollaborators().finally(() => {
    loading = false
  })

  collaborators = res.data
}

async function search() {
  loading = true
  if (!form.username)
    return

  const res = await searchUserByUsername(form.username).finally(() => {
    loading = false
  })
  if (!res.data)
    return ElMessage.info('无此用户')

  form.user = res.data
}

function showAddForm() {
  form = Object.assign({}, defaultForm)
  dialogType = 'new'
  dialogVisible = true
}

async function handleCreate() {
  if (!form.user)
    return ElMessage.error('请选择协作者')
  if (!form.roles?.length)
    return ElMessage.error('请选择协作者角色')

  // 不可为应用创建者
  if (form.user._id === app.created_by)
    return ElMessage.error('该用户是应用的创建人,无需添加')

  // 不可重复添加
  const exists = collaborators.filter(
    (co: any) => co.uid === form.user._id,
  )
  if (exists.length)
    return ElMessage.error('协作者已经存在')

  loading = true
  const res = await inviteCollaborator(
    form.user?._id,
    form.roles,
  ).finally(() => {
    loading = false
  })

  if (res.error)
    return ElMessage.error(res.error)

  ElMessage.success('操作成功')
  dialogVisible = false
  loadCollaborators()
}

async function handleDelete(row: any) {
  await ElMessageBox.confirm(`确定删除该协作者: ${row.user.name}？`)
  const uid = row.uid

  loading = true
  const res = await removeCollaborator(uid).finally(() => {
    loading = false
  })

  if (res.error) {
    ElMessage.error(`出错了:${res.error}`)
  }
  else {
    ElMessage.success('操作成功')
    loadCollaborators()
  }
}

onMounted(async () => {
  await getRoles()
  await loadCollaborators()
})
</script>

<template>
  <div class="app-container">
    <el-button size="small" type="default" @click="loadCollaborators">
      刷新
    </el-button>
    <el-button size="small" type="success" @click="showAddForm">
      添加协作者
    </el-button>
    <el-table :data="collaborators" style="width: 100%; margin-top: 30px" border>
      <el-table-column align="center" label="ID" width="220">
        <template #default="scope">
          {{ scope.row.uid }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名">
        <template #default="{ row }">
          <span v-if="row.user && row.user.username">{{
            row.user.username
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名">
        <template #default="{ row }">
          <span v-if="row.user && row.user.name">{{ row.user.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role.id" style="margin: 3px 5px">
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template #default="{ row }">
          <el-button size="small" plain type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog v-model="dialogVisible" title="协作者">
      <el-form v-loading="loading" :model="form" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" style="width: 300px" placeholder="请输入对方用户名" />
          <el-button size="small" type="primary" style="margin-left: 10px" @click="search">
            搜索
          </el-button>
        </el-form-item>
        <el-form-item v-if="form.user.username" label="用户">
          {{ form.user.name }} ({{ form.user.username }})
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" multiple placeholder="请选择角色">
            <el-option v-for="item in roles" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button size="small" type="info" @click="dialogVisible = false">
          取消
        </el-button>
        <el-button size="small" type="primary" @click="handleCreate">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 协作成员
meta:
  title: 协作成员
  index: 6-0
</route>
