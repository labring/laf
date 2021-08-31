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
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="showCreateForm">
        新建
      </el-button>
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
      <el-table-column label="ID" prop="id" align="center" width="240">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="目标环境名" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.label }}</span>
          <el-tag v-for="tag in row.tags" :key="tag">{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="部署地址" width="300px">
        <template slot-scope="{row}">
          <span>{{ row.url }}</span>
        </template>
      </el-table-column>
      <el-table-column label="部署令牌" align="center">
        <span>-</span>
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
      <el-table-column label="操作" align="center" width="340" class-name="small-padding fixed-width">
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
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { db } from '@/api/cloud'
import { Constants } from '../../api/constants'

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

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword } = this.listQuery
      const query = {}
      if (keyword) {
        query['$or'] = [
          { name: db.RegExp({ regexp: `.*${keyword}.*` }) },
          { label: db.RegExp({ regexp: `.*${keyword}.*` }) },
          { description: db.RegExp({ regexp: `.*${keyword}.*` }) }
        ]
      }

      // 执行数据查询
      const res = await db.collection(Constants.cn.deploy_targets)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .get()
        .catch(() => { this.listLoading = false })

      this.list = res.data

      // 获取数据总数
      const { total } = await db.collection(Constants.cn.deploy_targets)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .count()
        .catch(() => { this.listLoading = false })

      this.total = total
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
        const r = await db.collection(Constants.cn.deploy_targets)
          .add(this.form)

        if (!r.id) {
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

        // @TODO
        // 构建更新数据对象
        const data = {
          url: this.form.url,
          label: this.form.label,
          token: this.form.token,
          updated_at: Date.now()
        }

        // 执行更新请求
        const r = await db.collection(Constants.cn.deploy_targets)
          .where({ _id: this.form._id })
          .update(data)

        if (!r.ok) {
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
      const r = await db.collection(Constants.cn.deploy_targets)
        .where({ _id: row._id })
        .remove()

      if (!r.ok) {
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
    }
  }
}
</script>
