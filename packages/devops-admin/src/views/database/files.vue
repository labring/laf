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
      <!-- <el-button class="filter-item" type="primary" icon="el-icon-search" @click="showCreateForm">
        新建
      </el-button> -->
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
      <!-- <el-table-column label="ID" prop="id" align="center">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="文件" align="center" width="200">
        <template slot-scope="{row}">
          <a :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <img v-if="isImage(row)" class="thumb-image" :src="getFileUrl(row)">
            <svg-icon v-else icon-class="documentation" />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名" width="340" align="center">
        <template slot-scope="{row}">
          <span>{{ row.filename }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ getFileSize(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="180">
        <template slot-scope="{row}">
          <span v-if="row.contentType">{{ row.contentType }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180" align="center">
        <template slot-scope="{row}">
          <span v-if="row.uploadDate">{{ Date.parse(row.uploadDate) | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="bucket" width="120" align="center">
        <template slot-scope="{row}">
          <span>  {{ row.metadata.bucket }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <a :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <el-button plain type="success" size="mini">
              查看
            </el-button></a>
          <!-- <el-button type="primary" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button> -->
          <el-button v-if="row.status!='deleted'" plain size="mini" type="danger" @click="handleDelete(row)">
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
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="标题" prop="label">
          <el-input v-model="form.label" placeholder="显示标题" />
        </el-form-item>
        <el-form-item label="标识" prop="name">
          <el-input v-model="form.name" placeholder="唯一标识" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" :autosize="{ minRows: 3, maxRows: 6}" type="textarea" placeholder="描述" />
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
import * as fs from '@/api/file'
import { assert } from '@/utils/assert'
import { getFileToken } from '@/utils/auth'

// @TODO
// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    name: '',
    label: '',
    description: '',
    status: 0,
    tags: [],
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

// @TODO
// 表单验证规则
const formRules = {
  name: [{ required: true, message: '标识不可为空', trigger: 'blur' }],
  label: [{ required: true, message: '标题不可为空', trigger: 'blur' }]
}

export default {
  name: 'BucketsListPage',
  components: { Pagination },
  data() {
    return {
      bucket: null,
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
    this.bucket = this.$route.params?.bucket
    this.getList()
  },
  methods: {
    /**
       * 获取数据列表
       */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page } = this.listQuery

      // 执行数据查询
      const res = await fs.getFilesByBucketName(this.bucket, {
        limit,
        offset: (page - 1) * limit
      }).catch(() => { this.listLoading = false })

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
        const r = await db.collection('buckets')
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
          name: this.form.name,
          label: this.form.label,
          description: this.form.description,
          updated_at: Date.now()
        }

        // 执行更新请求
        const r = await db.collection('buckets')
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
    async handleDelete(row) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await fs.deleteFileById(this.bucket, row._id)

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

      this.getList()
    },
    // 查看详情
    async handleShowDetail(row) {
      // @TODO
      // 跳转到详情页
      this.$router.push(`buckets/${row._id}`)
    },
    // 拼装文件下载 URL
    getFileUrl(file) {
      assert(file && file.filename, 'invalid file or filename')
      const base_url = process.env.VUE_APP_BASE_API_APP + '/file'
      const bucket = this.bucket
      const file_url = `${base_url}/${bucket}/${file.filename}`
      if (this.bucket === 'public') {
        return file_url
      }
      const token = getFileToken()
      return file_url + `?token=${token}`
    },
    // 判断是否为图片类型
    isImage(row) {
      return row?.contentType?.startsWith('image/')
    },
    // 获取文件显示大小
    getFileSize(file) {
      const length = file.length ?? 0
      if (length > 1024 * 1024 * 1024) {
        return (length / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      } else if (length > 1024 * 1024) {
        return (length / (1024 * 1024)).toFixed(2) + ' MB'
      } else {
        return (length / 1024).toFixed(0) + ' kb'
      }
    }
  }
}
</script>

<style scoped>
.thumb-image {
  width: 100px;
}
</style>
