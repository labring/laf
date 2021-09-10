<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索"
        style="width: 200px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateForm">
        新建部署令牌
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="id" align="center" width="220">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="来源名称" width="150px">
        <template slot-scope="{row}">
          <span>{{ row.source }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" min-width="50px">
        <template slot-scope="{row}">
          <span>{{ row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template slot-scope="{row}">
          <span v-if="row.comment">{{ row.comment }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center">
        <template slot-scope="{row}">
          <el-tag v-for="item in row.data" :key="item._id" style="margin-right: 2px" type="default" size="mini" effect="plain">{{ item.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="120">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 'deployed'" type="success"> {{ row.status }}</el-tag>
          <el-tag v-if="row.status === 'pending'" type="warning"> {{ row.status }}</el-tag>
          <el-tag v-if="row.status === 'canceled'" type="info"> {{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="340" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <!-- <el-button type="success" plain size="mini" @click="handleShowDetail(row)">
            详情
          </el-button> -->
          <el-button v-if="row.status == 'pending'" type="primary" plain size="mini" @click="apply(row)">
            应用
          </el-button>
          <!-- <el-button v-if="row.status == 'pending'" size="mini" plain type="warning">
            取消
          </el-button> -->
          <el-button size="mini" plain type="danger" @click="handleDelete(row,$index)">
            删除
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

    <!-- 表单对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="150px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="来源名称" prop="source">
          <el-input v-model="form.source" maxlength="16" placeholder="用于标识部署来源" style="width: 400px" />
        </el-form-item>
        <el-form-item label="令牌权限" prop="permissions">
          <el-checkbox-group v-model="form.permissions">
            <el-checkbox label="function" border>云函数</el-checkbox>
            <el-checkbox label="policy" border>访问策略</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="过期时间(小时）" prop="expire">
          <el-input v-model="form.expire" type="number" />
        </el-form-item>
        <el-form-item v-if="token_created" label="返回结果" size="normal" style="width: 800px">
          <div class="token_result">
            {{ token_created }}
            <el-tag v-clipboard:message="token_created" v-clipboard:success="onCopy" type="success">复制</el-tag>
          </div>
        </el-form-item>
        <el-form-item label="接收部署地址" size="normal" style="width: 800px">
          <div>
            {{ getSelfDeployUrl() }}
            <el-tag v-clipboard:message="getSelfDeployUrl()" v-clipboard:success="onCopy" type="success">复制</el-tag>
          </div>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?handleCreate():handleUpdate()">
          生成
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { applyDeployRequest, createDeployToken, getDeployRequests, removeDeployRequest } from '../../api/deploy'
import { getAppAccessUrl } from '@/api/application'

// 默认的创建部署令牌表单
function getDefaultFormValue() {
  return {
    source: '',
    expire: 1,
    permissions: ['function', 'policy'],
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

// 表单验证规则
const formRules = {
  permissions: [{ required: true, message: '权限不可为空', trigger: 'blur' }],
  expire: [{ required: true, message: '过期时间不可为空', trigger: 'blur' }],
  source: [{ required: true, message: '部署来源不可为空', trigger: 'blur' }]
}

export default {
  name: 'DeployRequestsListPage',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      status = status ?? 0
      // 状态映射表
      const statusMap = {
        0: 'published'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        keyword: undefined
      },
      form: getDefaultFormValue(),
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建令牌'
      },
      rules: formRules,
      token_created: null
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true
      const { limit, page, keyword } = this.listQuery
      const query = { }
      if (keyword) { query['keyword'] = keyword }

      const res = await getDeployRequests(query, page, limit)
      this.list = res.data
      this.total = res.total
      this.listLoading = false
    },
    /**
     * 应用部署请求
     */
    async apply(data) {
      const r = await applyDeployRequest(data._id)
      if (r.code === 0) {
        this.$message.success('应用成功！')
        this.getList()
      } else {
        this.$message.error('出错了')
      }
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 显示创建表单
    showCreateForm() {
      this.form = getDefaultFormValue()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 创建部署令牌请求
    handleCreate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        const data = {
          permissions: this.form.permissions,
          expire: this.form.expire,
          source: this.form.source
        }
        // 执行创建请求
        const r = await createDeployToken(data)

        if (r.error) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '创建失败！' + r.error
          })
          return
        }

        this.token_created = r.data?.token
        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功！'
        })
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await removeDeployRequest(row._id)

      if (r.error) {
        return this.$notify({ type: 'error', title: '操作失败', message: '删除失败！' + r.error })
      }

      this.$notify({ type: 'success', title: '操作成功', message: '删除成功！' })
      this.getList()
    },
    // 查看详情
    // async handleShowDetail(row) {
    //   // 跳转到详情页
    //   this.$router.push(`deploy_requests/${row._id}`)
    // },
    onCopy() {
      this.$message.success('已复制')
    },
    getSelfDeployUrl() {
      const base = getAppAccessUrl()
      return base + '/deploy/incoming'
    }
  }
}
</script>

<style scoped>
.token_result {
  display: block;
  border: 1px solid lightgray;
  background-color: #eafff5e0;
  padding: 8px;
  line-height: 20px;
  border-radius: 8px;
  color: gray;
}
</style>
