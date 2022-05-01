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
      <el-button class="filter-item" type="default" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button plain class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateForm">
        新建
      </el-button>
      <el-tooltip content="发布策略：策略修改后需要发布才能生效" placement="bottom" effect="light">
        <el-button plain class="filter-item" type="success" icon="el-icon-guide" @click="publish">
          发布策略
        </el-button>
      </el-tooltip>
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <!-- <el-table-column label="ID" prop="id" align="center" width="220">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="标识" align="center" width="160px">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入口地址" align="left" width="150px">
        <template slot-scope="{row}">
          <span>/proxy/{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="说明" align="center">
        <template slot-scope="{row}">
          <span v-if="row.description">{{ row.description }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag type="success">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="260" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="primary" size="mini" @click="handleShowDetail(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
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
        label-width="70px"
        style="width: 500px; margin-left:50px;"
      >
        <el-form-item label="标识" prop="name">
          <el-input v-model="form.name" placeholder="唯一标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" :autosize="{ minRows: 3, maxRows: 6}" type="textarea" placeholder="描述" />
        </el-form-item>
        <el-form-item label="injector">
          <el-select v-model="form.injector" placeholder="选择云函数做为injector">
            <el-option
              label="无"
              :value="null"
            />
            <el-option
              v-for="item in functions"
              :key="item._id"
              :label="item.label"
              :value="item.name"
            />
          </el-select>
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
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { createPolicy, removePolicy, getPolicies, publishPolicies, updatePolicy } from '@/api/policy'
import { getFunctions } from '@/api/func'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    name: '',
    description: '',
    injector: null,
    rules: {},
    status: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '标识不可为空', trigger: 'blur' }],
  label: [{ required: true, message: '标题不可为空', trigger: 'blur' }]
}

export default {
  name: 'PoliciesListPage',
  components: {
    Pagination
  },
  filters: {
    statusFilter(status) {
      status = status ?? 0
      // 状态映射表
      const statusMap = {
        0: '停用',
        1: '启用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      tableKey: 0,
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
        create: '创建'
      },
      rules: formRules,
      downloadLoading: false,
      functions: []
    }
  },
  created() {
    this.getFunctions()
    this.getList()
  },
  methods: {
    async getFunctions() {
      // get all functions
      const r = await getFunctions({ status: 1 }, 1, 9999)
      this.functions = r.data ?? []
    },
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword } = this.listQuery
      const query = {}
      if (keyword) {
        query[keyword] = keyword
      }

      // 执行数据查询
      const res = await getPolicies(query, page, limit)
      this.list = res.data

      this.total = res.total
      this.listLoading = false
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
    // 创建请求
    handleCreate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        // 执行创建请求
        const r = await createPolicy(this.form)

        if (r.error) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '创建失败！' + r.error
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功！'
        })

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
          name: this.form.name,
          label: this.form.label,
          injector: this.form.injector,
          status: this.form.status,
          description: this.form.description
        }

        // 执行更新请求
        const r = await updatePolicy(this.form._id, data)

        if (r.error) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '更新失败！' + r.error
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '更新成功！'
        })

        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await removePolicy(row._id)

      if (r.error) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: '删除失败！' + r.error
        })
        return
      }

      this.$notify({
        type: 'success',
        title: '操作成功',
        message: '删除成功！'
      })

      this.list.splice(index, 1)
    },
    // 发布访问策略
    async publish() {
      const confirm = await this.$confirm('确定发布所有规则？')
        .catch(() => false)

      if (!confirm) return
      const res = await publishPolicies()
      if (res.error) {
        this.$message('发布失败: ' + res.error)
        return
      }
      this.$notify({
        type: 'success',
        title: '发布成功',
        message: '访问策略发布成功！'
      })
    },
    // 查看详情
    async handleShowDetail(row) {
      this.$router.push(`policies/${row._id}`)
    }
  }
}
</script>
