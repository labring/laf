<script lang="ts" setup>
import dayjs from 'dayjs'
import { acceptReplicateRequest, deleteReplicateRequest, getReplicateRequests } from '~/api/replicate'

let list = $ref([])
let total = $ref(0)
let listLoading = $ref(true)
const listQuery = $ref({ limit: 10, page: 1 })

async function getList() {
  listLoading = true

  const res = await getReplicateRequests(listQuery)
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  total = res.total
  list = res.data.map((item: any) => {
    item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
    if (item.updated_at)
      item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
    return item
  })
  listLoading = false
}

async function handleUpdateRequest(request: any) {
  await ElMessageBox.confirm('是否接受此部署？', '部署确认')

  const res = await acceptReplicateRequest(request._id, 'accepted')
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  getList()
}

async function handleDeleteRequest(request: any) {
  await ElMessageBox.confirm('确认要删除此部署？', '删除确认')

  const res = await deleteReplicateRequest(request._id)
  if (res.code) {
    ElNotification({
      type: 'error',
      title: '操作失败',
      message: res.message,
    })
    return
  }

  getList()
}

onMounted(() => {
  getList()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据列表 -->
    <el-table :data="list" :loading="listLoading" border style="width: 100%">
      <el-table-column prop="source_appid" label="源应用" width="180" align="center" />
      <el-table-column prop="target_appid" label="目标应用" align="center" />
      <el-table-column prop="created_at" label="创建时间" width="180" align="center" />
      <el-table-column prop="updated_at" label="更新时间" width="180" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'accepted' ? 'success' : 'warning'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button v-if="scope.row.status !== 'accepted'" type="primary" @click="handleUpdateRequest(scope.row)">
            接受
          </el-button>
          <el-button type="danger" @click="handleDeleteRequest(scope.row)">
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
  </div>
</template>

<route lang="yaml">
name: 部署请求
meta:
  title: 部署请求
  index: 4-1
</route>
