<script setup lang="ts">
import FunctionLogDetail from '../components/FunctionLogDetail.vue'
import { getFunctionLogs } from '~/api/func'

const route = useRoute()

const tableKey = $ref(0)
let func_id: any = $ref(null)
let list = $ref(null)
let total = $ref(0)
let listLoading = $ref(true)
const listQuery: any = $ref({
  page: 1,
  limit: 20,
  keyword: undefined,
  triggerId: undefined,
})
let isDialogVisiable = $ref(false)
let detail: any = $ref(null)

const dialogTitle = $computed(() => {
  return `函数执行日志: ${detail?.func_name}`
})

onMounted(() => {
  func_id = route.params.id ?? undefined
  const triggerId = route.query?.trigger_id
  listQuery.triggerId = triggerId ?? undefined
  getList()
  setTagViewTitle()
})

async function getList() {
  listLoading = true

  // 拼装查询条件 by listQuery
  const { limit, page, keyword, triggerId } = listQuery
  const query: any = {}
  if (keyword)
    query.requestId = keyword

  if (func_id)
    query.func_id = func_id

  if (triggerId)
    query.trigger_id = triggerId

  // 执行数据查询
  const res = await getFunctionLogs(query, page, limit).catch(() => {
    listLoading = false
  })

  list = res.data
  total = res.total
  listLoading = false
}

function handleFilter() {
  listQuery.page = 1
  getList()
}

async function handleShowDetail(row: any) {
  detail = row
  isDialogVisiable = true
}

function setTagViewTitle() {
  if (func_id) {
    const label = func_id
    const title = route.meta.title
    const _route = Object.assign({}, route, {
      title: `${title}: ${label}`,
    })
    // $store.dispatch('tagsView/updateVisitedView', route)
  }
  if (listQuery.triggerId) {
    const label = `trigger - ${listQuery.triggerId}`
    const title = route.meta.title
    const _route = Object.assign({}, route, {
      title: `${title}: ${label}`,
    })
    // $store.dispatch('tagsView/updateVisitedView', route)
  }
}
</script>

<template>
  <div class="app-container bg-white">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-input
        v-model="listQuery.keyword" placeholder="Request ID" style="width: 320px; margin-right: 10px"
        class="filter-item" @keyup.enter="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="Search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :key="tableKey" v-loading="listLoading" :data="list" border highlight-current-row style="width: 100%">
      <el-table-column label="RequestId" prop="id" align="center" width="300">
        <template #default="{ row }">
          <span>{{ row.requestId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="函数名" min-width="200" align="center">
        <template #default="{ row }">
          <el-tag type="success">
            {{ row.func_name }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="函数ID" min-width="160" align="center">
        <template #default="{ row }">
          <span>{{ row.func_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行用时" width="120" align="right">
        <template #default="{ row }">
          <span v-if="row.time_usage">{{ row.time_usage }}ms</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180" align="center">
        <template #default="{ row }">
          <span v-if="row.created_at">{{
            $filters.formatTime(row.created_at)
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="调用者ID" class-name="status-col" width="240">
          <template slot-scope="{row}">
            {{ row.created_by || '-' }}
          </template>
        </el-table-column> -->
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleShowDetail(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:currentPage="listQuery.page" class="mt-24px" :page-size="listQuery.limit" background
      layout="->, total, prev, pager, next" :total="total" @size-change="getList" @current-change="getList"
    />

    <!-- 日志详情对话框 -->
    <el-dialog v-if="detail" v-model="isDialogVisiable" :title="dialogTitle">
      <FunctionLogDetail :data="detail" />
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 日志详情
hidden: true
meta:
  title: 日志详情
</route>
