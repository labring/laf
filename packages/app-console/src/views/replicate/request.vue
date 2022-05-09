<template>
  <div class="app-container">
    <!-- 数据列表 -->
    <el-table
      :data="list"
      :loading="listLoading"
      border
      style="width: 100%;"
    >
      <el-table-column
        prop="source_appid"
        label="源应用"
        width="180"
        align="center"
      />
      <el-table-column
        prop="target_appid"
        label="目标应用"
        align="center"
      />
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
      <el-table-column
        prop="status"
        label="状态"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 'accepted' ? 'success' : 'warning'"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="200"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status !== 'accepted'"
            size="mini"
            plain
            type="primary"
            @click="handleUpdateRequest(scope.row)"
          >接受</el-button>
          <el-button
            size="mini"
            plain
            type="danger"
            @click="handleDeleteRequest(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getReplicateRequests"
    />
  </div>
</template>

<script>
import store from '@/store'
import dayjs from 'dayjs'
import Pagination from '@/components/Pagination'
import {
  getReplicateRequests,
  createReplicateRequest,
  acceptReplicateRequest,
  deleteReplicateRequest
} from '../../api/replicate'

export default {
  components: {
    Pagination
  },
  data() {
    return {
      appid: '',
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        limit: 10,
        page: 1
      },
      form: {
        target_appid: '',
        permissions: []
      },
      rules: {
        target_appid: [
          { required: true, message: '请输入目标应用appid', trigger: 'blur' }
        ]
      },
      dialogFormVisible: false,
      requestType: 'target' // target | source
    }
  },
  created() {
    this.appid = store.state.app.appid
    this.getReplicateRequests()
  },
  methods: {
    showCreateForm() {
      this.dialogFormVisible = true
    },
    async getReplicateRequests() {
      this.listLoading = true

      const res = await getReplicateRequests(this.listQuery)
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.total = res.total
      this.list = res.data.map(item => {
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
        if (item.updated_at) item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
        return item
      })
      this.listLoading = false
    },
    async handleCreateRequest() {
      this.$refs['createForm'].validate(async(valid) => {
        if (!valid) { return }

        const params = {
          target_appid: this.form.target_appid
        }
        if (this.form.permissions.includes('function')) {
          params.functions = {
            type: 'all',
            items: []
          }
        }
        if (this.form.permissions.includes('policy')) {
          params.policies = {
            type: 'all',
            items: []
          }
        }

        const res = await createReplicateRequest(params)

        if (res.code) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: res.message
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功！'
        })

        this.getReplicateRequests()
        this.dialogFormVisible = false
      })
    },
    async handleUpdateRequest(request) {
      await this.$confirm('是否接受此部署？', '部署确认')

      const res = await acceptReplicateRequest(request._id, 'accepted')
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.getReplicateRequests()
    },
    async handleDeleteRequest(request) {
      await this.$confirm('确认要删除此部署？', '删除确认')

      const res = await deleteReplicateRequest(request._id)
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.getReplicateRequests()
    }
  }
}

</script>

<style lang="scss" scoped>
.tabs {
  margin-bottom: 0;
  border-bottom: 0;
}
</style>
