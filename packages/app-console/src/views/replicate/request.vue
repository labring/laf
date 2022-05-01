<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button
        plain
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="showCreateForm"
      >
        创建部署请求
      </el-button>
    </div>

    <!-- 数据列表 -->
    <el-table
      :data="list"
      :loading="listLoading"
      border
      style="width: 100%;top: -15px;"
    >
      <el-table-column
        prop="source_appid"
        label="源应用"
        width="180"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="target_appid"
        label="目标应用"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="created_at"
        label="创建时间"
        width="180"
        align="center"
      ></el-table-column>
      <el-table-column
        prop="updated_at"
        label="更新时间"
        width="180"
        align="center"
      ></el-table-column>
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
          >同意</el-button>
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

    <el-dialog :visible.sync="dialogFormVisible" title="请求部署">
      <el-form 
        ref="createForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:20px;"
      >
        <el-form-item label="目标appid" prop="target_appid">
          <el-select
            v-model="form.target_appid"
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in targetAppids"
              :key="item"
              :label="item"
              :value="item"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="部署权限" prop="permissions">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox label="function" border>云函数</el-checkbox>
            <el-checkbox label="policy" border>访问策略</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleCreateRequest">
          确定
        </el-button>
      </div>
    </el-dialog>
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
  deleteReplicateRequest,
  getReplicateAuths
} from '../../api/replicate'
import { filter } from 'lodash'

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
        page: 1,
      },
      form: {
        target_appid: '',
        permissions: [],
      },
      rules: {
        target_appid: [
          { required: true, message: '请输入目标应用appid', trigger: 'blur' },
        ],
      },
      dialogFormVisible: false,
      requestType: 'target', // target | source
      targetAppids:[],
    }
  },
  created () {
    this.appid = store.state.app.appid
    this.getReplicateTargetAppid()
    this.getReplicateRequests()
  },
  methods: {
    handleSwitchType({name}) {
      this.requestType = name
      this.switchList()
    },
    showCreateForm() {
      this.dialogFormVisible = true
    },
    async getReplicateTargetAppid() {
      const res = await getReplicateAuths()
      if (res.code) {
        return
      }

      this.targetAppids = res.data
      .filter(item => item.source_appid === this.appid)
      .map(item => item.target_appid)
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
          target_appid: this.form.target_appid,
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
      await this.$confirm('是否同意此部署？', '部署确认')

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
    },
  },
}

</script>

<style lang="scss" scoped>
.tabs {
  margin-bottom: 0;
  border-bottom: 0;
}
</style>
