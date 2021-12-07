<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        size="small"
        placeholder="Request ID"
        style="width: 320px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button size="small" class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      size="mini"
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="RequestId" prop="id" align="center" width="260">
        <template slot-scope="{row}">
          <span>{{ row.requestId }}</span>
        </template>
      </el-table-column>
      <el-table-column label="函数名" min-width="200" align="center">
        <template slot-scope="{row}">
          <el-tag type="primary">{{ row.func_name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="函数ID" min-width="160" align="center">
        <template slot-scope="{row}">
          <span class="link-type">{{ row.func_id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="执行用时" width="100" align="center">
        <template slot-scope="{row}">
          <span v-if="row.time_usage" class="link-type">{{ row.time_usage }}ms</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="调用者ID" class-name="status-col" width="240">
        <template slot-scope="{row}">
          {{ row.created_by || '-' }}
        </template>
      </el-table-column> -->
      <el-table-column label="操作" align="center" width="80" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="info" size="mini" @click="handleShowDetail(row)">
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 日志详情对话框 -->
    <el-dialog v-if="detail" :visible.sync="isDialogVisiable" :title="dialogTitle">
      <FunctionLogDetail :data="detail" />
    </el-dialog>
  </div>
</template>

<script>
import FunctionLogDetail from './components/FunctionLogDetail'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { getFunctionLogs } from '@/api/func'

export default {
  name: 'FunctionlogsListPage',
  components: { Pagination, FunctionLogDetail },
  data() {
    return {
      tableKey: 0,
      func_id: null,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined,
        triggerId: undefined
      },
      textMap: {
        update: '编辑',
        create: '创建'
      },
      isDialogVisiable: false,
      detail: null
    }
  },
  computed: {
    dialogTitle() {
      return '函数执行日志: ' + this.detail?.func_name
    }
  },
  created() {
    this.func_id = this.$route.params.id ?? undefined
    const triggerId = this.$route.query?.trigger_id
    this.listQuery.triggerId = triggerId ?? undefined
    this.getList()
    this.setTagViewTitle()
  },
  methods: {
    /**
       * 获取数据列表
       */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword, triggerId } = this.listQuery
      const query = {}
      if (keyword) {
        query['requestId'] = keyword
      }

      if (this.func_id) {
        query['func_id'] = this.func_id
      }

      if (triggerId) {
        query['trigger_id'] = triggerId
      }

      // 执行数据查询
      const res = await getFunctionLogs(query, page, limit)
        .catch(() => { this.listLoading = false })

      this.list = res.data
      this.total = res.total
      this.listLoading = false
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 查看详情
    async handleShowDetail(row) {
      this.detail = row
      this.isDialogVisiable = true
    },
    setTagViewTitle() {
      if (this.func_id) {
        const label = this.func_id
        const title = this.$route.meta.title
        const route = Object.assign({}, this.$route, { title: `${title}: ${label}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
      if (this.listQuery.triggerId) {
        const label = 'trigger - ' + this.listQuery.triggerId
        const title = this.$route.meta.title
        const route = Object.assign({}, this.$route, { title: `${title}: ${label}` })
        this.$store.dispatch('tagsView/updateVisitedView', route)
      }
    }
  }
}
</script>

<style scoped>
.pagination-container {
  padding: 0;
  margin-top: 10px;
}
</style>
