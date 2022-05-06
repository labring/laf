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
        新增授权
      </el-button>
    </div>

    <el-tabs v-model="authType" class="tabs" type="card" @tab-click="handleSwitchType">
      <el-tab-pane label="目标应用" name="target" />
      <el-tab-pane label="授权请求" name="source" />
    </el-tabs>

    <!-- 数据列表 -->
    <el-table
      :data="tableList"
      :loading="listLoading"
      border
      style="width: 100%;top: -15px;"
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
            v-if="authType === 'target' && scope.row.status=== 'accepted'"
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
          >接受</el-button>
          <el-button
            size="mini"
            plain
            type="danger"
            @click="handleDeleteAuth(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogFormVisible" title="请求授权">
      <el-form
        ref="createForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:20px;"
      >
        <el-form-item label="目标appid" prop="target_appid">
          <el-input v-model="form.target_appid" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleCreateAuth">
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="replicasDialogVisible" title="请求部署">
      <el-form
        ref="createForm"
        :rules="rules"
        :model="replicasForm"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:20px;"
      >
        <el-form-item label="目标 appid" prop="target_appid">
          <el-input v-model="replicasForm.target_appid" disabled />
        </el-form-item>
        <el-form-item label="部署权限" prop="permissions">
          <el-checkbox-group v-model="replicasForm.permissions">
            <el-checkbox label="function" border>云函数</el-checkbox>
            <el-checkbox label="policy" border>访问策略</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="replicasDialogVisible = false">
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
import { getReplicateAuths, createReplicateAuth, acceptReplicateAuth, deleteReplicateAuth, createReplicateRequest } from '../../api/replicate'

export default {
  data() {
    return {
      appid: '',
      list: [],
      tableList: [],
      listLoading: true,
      listQuery: {
        onlyEnabled: false
      },
      form: {
        target_appid: ''
      },
      rules: {
        target_appid: [
          { required: true, message: '请输入目标应用appid', trigger: 'blur' }
        ]
      },
      dialogFormVisible: false,

      authType: 'target', // target | source
      replicasDialogVisible: false,
      replicasForm: {
        target_appid: '',
        permissions: []
      }
    }
  },
  created() {
    this.appid = store.state.app.appid
    this.getReplicateAuths()
  },
  methods: {
    handleSwitchType({ name }) {
      this.authType = name
      this.switchList()
    },
    switchList() {
      if (this.authType === 'target') {
        this.tableList = this.list.filter(item => item.source_appid === this.appid)
      } else {
        this.tableList = this.list.filter(item => item.target_appid === this.appid)
      }
    },
    showReplicasForm(row) {
      this.replicasForm.target_appid = row.target_appid
      this.replicasDialogVisible = true
    },
    async handleCreateRequest() {
      this.$refs['createForm'].validate(async(valid) => {
        if (!valid) { return }

        if (this.replicasForm.permissions.length === 0) {
          this.$message.warning('请至少选择一个部署权限')
          return
        }

        const params = {
          target_appid: this.replicasForm.target_appid
        }
        if (this.replicasForm.permissions.includes('function')) {
          params.functions = {
            type: 'all',
            items: []
          }
        }
        if (this.replicasForm.permissions.includes('policy')) {
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
          message: '部署成功，等待目标应用接受。'
        })

        this.replicasDialogVisible = false
      })
    },
    showCreateForm() {
      this.dialogFormVisible = true
    },
    async getReplicateAuths() {
      this.listLoading = true

      const res = await getReplicateAuths()
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.list = res.data.map(item => {
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
        if (item.updated_at) item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
        return item
      })
      this.switchList()
      this.listLoading = false
    },
    async handleCreateAuth() {
      this.$refs['createForm'].validate(async(valid) => {
        if (!valid) { return }

        const res = await createReplicateAuth(this.form.target_appid)

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

        this.getReplicateAuths()
        this.dialogFormVisible = false
      })
    },
    async handleUpdateAuth(auth) {
      await this.$confirm('是否接受此授权？', '授权确认')

      const res = await acceptReplicateAuth(auth._id)
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.getReplicateAuths()
    },
    async handleDeleteAuth(auth) {
      await this.$confirm('确认要删除此授权？', '删除确认')

      const res = await deleteReplicateAuth(auth._id)
      if (res.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: res.message
        })
        return
      }

      this.getReplicateAuths()
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
