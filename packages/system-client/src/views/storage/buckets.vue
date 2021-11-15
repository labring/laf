<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button plain class="filter-item" type="default" icon="el-icon-search" @click="getList">
        刷新
      </el-button>
      <el-button plain class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateForm">
        新建文件桶(Bucket)
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
      <el-table-column label="文件桶(Bucket)" width="200">
        <template slot-scope="{row}">
          <span>{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="默认权限" align="center" width="100">
        <template slot-scope="{row}">
          <span v-if="row.mode === 0">
            <el-tag type="info" size="small" effect="plain">私有</el-tag>
          </span>
          <span v-if="row.mode === 1">
            <el-tag type="primary" size="small" effect="plain">公共读</el-tag>
          </span>
          <span v-if="row.mode === 2">
            <el-tag type="danger" size="small" effect="plain">公共读写</el-tag>
          </span>
        </template>
      </el-table-column>
      <el-table-column label="Bucket URL">
        <template slot-scope="{row}">
          <span>{{ getBucketUrl(row.name) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" class-name="small-padding" width="260">
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="handleShowDetail(row)">
            管理文件
          </el-button>
          <el-button type="success" size="mini" @click="showEditForm(row)">
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
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="文件桶名" prop="name">
          <el-input v-model="form.name" :disabled="dialogStatus==='update'" placeholder="唯一标识" />
        </el-form-item>
        <el-form-item label="默认权限" prop="mode">
          <el-select v-model="form.mode" placeholder="">
            <el-option label="私有" :value="0" />
            <el-option label="公共读" :value="1" />
            <el-option label="公共读写" :value="2" />
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
import * as fs from '@/api/file'
import { assert } from '@/utils/assert'
import { showError, showSuccess } from '@/utils/show'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: '',
    mode: 0
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: 'Bucket 名字不可为空', trigger: 'blur' }],
  mode: [{ required: true, message: 'Bucket 权限为必选', trigger: 'blur' }]
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
      assert(ret.code === 0, 'get file buckets got error')

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

        if (/^[\w|\d]{1,32}$/g.test(this.form.name) === false) {
          return showError('Bucket 名称长度必须在 1～32 之间，且只能包含字母、数字和下划线')
        }

        // 执行创建请求
        const r = await fs.createFileBucket(this.form.name, this.form.mode)

        if (r.code) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: r.error
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
    // 显示编辑表单
    showEditForm(row) {
      this.form = { ...row }
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

        // 执行更新请求
        const r = await fs.updateFileBucket(this.form.name, this.form.mode)

        if (r.code) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: r.error
          })
          return
        }

        showSuccess('更新成功')

        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await fs.deleteFileBucket(row.name)

      if (r.code === 'BUCKET_NOT_EMPTY') {
        return showError('不可删除非空文件桶')
      }
      if (r.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: '删除失败:' + r.error
        })
        return
      }

      showSuccess('删除成功！')

      this.list.splice(index, 1)
    },
    // 获取 bucket 地址
    getBucketUrl(bucketName) {
      return fs.getAppFileBucketUrl(bucketName)
    },
    // 查看详情
    async handleShowDetail(row) {
      // 跳转到详情页
      this.$router.push(`files/${row.name}`)
    }
  }
}
</script>
