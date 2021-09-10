<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        size="mini"
        placeholder="按文件名检索"
        style="width: 400px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-upload" @click="showCreateForm">
        上传文件
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
      <!-- <el-table-column label="ID" prop="id" align="center">
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column> -->
      <el-table-column label="文件" align="center">
        <template slot-scope="{row}">
          <a :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <img v-if="isImage(row)" class="thumb-image" :src="getFileUrl(row)">
            <i v-else-if="isVideo(row)" class="el-icon-video-play" style="font-size: 40px" />
            <i v-else class="el-icon-paperclip" style="font-size: 40px" />
          </a>
        </template>
      </el-table-column>
      <el-table-column label="文件名" width="330" align="center">
        <template slot-scope="{row}">
          <span>{{ row.filename }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" align="center">
        <template slot-scope="{row}">
          <span>{{ getFileSize(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <span>{{ getContentType(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180" align="center">
        <template slot-scope="{row}">
          <span v-if="row.uploadDate">{{ Date.parse(row.uploadDate) | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="bucket" align="center">
        <template slot-scope="{row}">
          <span>  {{ row.metadata.bucket }}</span>
        </template>
      </el-table-column>
      <el-table-column label="原文件名" align="center">
        <template slot-scope="{row}">
          <span>  {{ row.metadata.original_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <a :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <el-button plain type="success" size="mini">
              查看
            </el-button></a>
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
    <el-dialog title="上传文件" width="400px" :visible.sync="dialogFormVisible">
      <el-upload
        drag
        :action="getUploadUrl()"
        :on-success="onUploadSuccess"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <!-- <div slot="tip" class="el-upload__tip">一次可上传一个文件</div> -->
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as fs from '@/api/file'
import { assert } from '@/utils/assert'
import { getAppAccessUrl } from '@/api/application'

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
      dialogFormVisible: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      downloadLoading: false
    }
  },
  created() {
    this.bucket = this.$route.params?.bucket
    this.getList()
    this.setTagViewTitle()
  },
  methods: {
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword } = this.listQuery

      // 执行数据查询
      const res = await fs.getFilesByBucketName(this.bucket, {
        limit,
        offset: (page - 1) * limit,
        keyword
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
    // 显示上传表单
    showCreateForm() {
      this.dialogFormVisible = true
    },
    // 上传成功回调
    onUploadSuccess(event) {
      this.$message.success('上传成功')
      this.getList()
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
    // 拼装文件下载 URL
    getFileUrl(file) {
      assert(file && file.filename, 'invalid file or filename')
      const app_url = getAppAccessUrl()
      const file_url = `${app_url}/file/${this.bucket}/${file.filename}`
      if (this.bucket === 'public') {
        return file_url
      }
      const token = this.$store.state.app.file_token
      return file_url + `?token=${token}`
    },
    // 拼装文件上传地址
    getUploadUrl() {
      assert(this.bucket, 'empty bucket name got')
      const app_url = getAppAccessUrl()
      const file_url = `${app_url}/file/upload/${this.bucket}`
      const token = this.$store.state.app.file_token
      return file_url + `?token=${token}`
    },
    getContentType(row) {
      return row?.metadata?.contentType ?? row?.contentType ?? 'unknown'
    },
    // 判断是否为图片类型
    isImage(row) {
      return this.getContentType(row)?.startsWith('image/')
    },
    // 判断是否为视频类型
    isVideo(row) {
      return this.getContentType(row).startsWith('video/')
    },
    // 获取文件显示大小
    getFileSize(file) {
      const length = file.length ?? 0
      if (length > 1024 * 1024 * 1024) {
        return (length / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
      } else if (length > 1024 * 1024) {
        return (length / (1024 * 1024)).toFixed(2) + ' MB'
      } else if (length > 1024) {
        return (length / 1024).toFixed(0) + ' kb'
      } else if (length) {
        return length + ' bytes'
      }
    },
    // 设置标签页名
    setTagViewTitle() {
      const label = this.bucket
      const title = this.$route.meta.title
      const route = Object.assign({}, this.$route, { title: `${label} - ${title}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    }
  }
}
</script>

<style scoped>
.thumb-image {
  width: 100px;
  max-height: 60px;
}
</style>
