<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button class="filter-item" type="default" icon="el-icon-refresh" @click="getList">
        刷新
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="showCreateForm">
        新建
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
      size="mini"
    >
      <el-table-column label="目标环境名" min-width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.label }}</span>
          <el-tag v-for="tag in row.tags" :key="tag">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="部署地址" width="300">
        <template slot-scope="{row}">
          <span>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部署令牌" align="center">
        <span>-</span>
      </el-table-column>
      <el-table-column label="创建/更新" width="150" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span><br>
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="140px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="目标名称" prop="label">
          <el-input v-model="form.label" placeholder="测试环境、生产环境" style="width: 400px" />
        </el-form-item>
        <el-form-item label="目标地址" prop="url">
          <el-input v-model="form.url" style="width: 400px" />
        </el-form-item>
        <el-form-item label="部署令牌" prop="token">
          <el-input v-model="form.token" style="width: 400px" :autosize="{ minRows: 3, maxRows: 6}" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?handleCreate():handleUpdate()">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createDeployTarget, getDeployTargets, removeDeployTarget, updateDeployTarget } from '@/api/deploy'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    url: '',
    label: '',
    token: '',
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

// 表单验证规则
const formRules = {
  url: [{ required: true, message: '部署目标地址不可为空', trigger: 'blur' }],
  token: [{ required: true, message: '部署令牌不可为空', trigger: 'blur' }],
  label: [{ required: true, message: '标题不可为空', trigger: 'blur' }]
}

export default {
  name: 'DeployTargetsListPage',
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
      form: getDefaultFormValue(),
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: formRules,
      downloadLoading: false
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
      const res = await getDeployTargets()
      this.list = res.data
      this.listLoading = false
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
    // 创建请求
    handleCreate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        const r = await createDeployTarget(this.form)
        if (r.error) {
          return this.$notify({ type: 'error', title: '操作失败', message: '创建失败！' + r.error })
        }

        this.$notify({ type: 'success', title: '操作成功', message: '创建成功！' })
        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 显示更新表单
    showUpdateForm(row) {
      this.form = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    // 更新请求
    handleUpdate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        // 构建更新数据对象
        const data = {
          url: this.form.url,
          label: this.form.label,
          token: this.form.token
        }

        // 执行更新请求
        const r = await updateDeployTarget(this.form._id, data)
        if (r.error) {
          return this.$notify({ type: 'error', title: '操作失败', message: '更新失败！' + r.error })
        }

        this.$notify({ type: 'success', title: '操作成功', message: '更新成功！' })
        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      const r = await removeDeployTarget(row._id)
      if (r.error) {
        return this.$notify({ type: 'error', title: '操作失败', message: '删除失败！' + r.error })
      }

      this.$notify({ type: 'success', title: '操作成功', message: '删除成功！' })
      this.getList()
    }
  }
}
</script>
