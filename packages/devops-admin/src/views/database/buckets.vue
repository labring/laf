<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="getList">
        刷新
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
      <el-table-column label="序号" align="center" width="240">
        <template slot-scope="{$index}">
          <span>{{ $index + 1 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="标识">
        <template slot-scope="{row}">
          <span>{{ row }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding">
        <template slot-scope="{row, $index}">
          <el-button type="success" size="mini" @click="handleShowDetail(row)">
            详情
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
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="标识" prop="name">
          <el-input v-model="form.name" placeholder="唯一标识" />
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
import * as fs from '@/api/file'

// @TODO
// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: ''
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: 'bucket 名字不可为空', trigger: 'blur' }]
}

export default {
  name: 'BucketsListPage',
  components: { },
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

      // 执行数据查询
      const ret = await fs.getFileBuckets().catch(() => { this.listLoading = false })
      this.list = ret.data

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

        // 执行创建请求
        const r = await fs.createFileBucket(this.form.name)

        if (r.code) {
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
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await fs.deleteFileBucket(row)

      if (r.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: '删除失败:' + r.error
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
    // 查看详情
    async handleShowDetail(row) {
      // 跳转到详情页
      this.$router.push(`files/${row}`)
    }
  }
}
</script>
