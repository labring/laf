<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <!-- <el-input
        v-model="listQuery.keyword"
        size="mini"
        placeholder="暂不支持搜索"
        style="width: 400px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      /> -->
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-refresh" @click="handleFilter">
        刷新
      </el-button>
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-upload" @click="showCreateForm">
        上传文件
      </el-button>
      <el-button size="mini" plain class="filter-item" type="default" icon="el-icon-new" @click="createDirectory">
        新建目录
      </el-button>
      <div class="filter-item" style="margin-left: 20px;">
        <span style="font-size: 16px;color: gray; margin-right: 5px;">当前:</span>
        <path-link :path="currentPath" @change="onChangeDirectory" />
      </div>
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
      <el-table-column label="文件" align="center">
        <template slot-scope="{row}">
          <a v-if="getContentType(row) !== 'application/x-directory'" :href="getFileUrl(row)" target="blank">
            <img
              v-if="isImage(row)"
              class="thumb-image"
              :src="getFileUrl(row)"
            >
            <i v-else-if="isVideo(row)" class="el-icon-video-play" style="font-size: 40px" />
            <i v-else-if="getContentType(row) === 'application/x-directory'" class="el-icon-folder-opened" style="font-size: 36px; color: orange" />
            <i v-else class="el-icon-paperclip" style="font-size: 40px" />
          </a>
          <i v-if="getContentType(row) === 'application/x-directory'" class="el-icon-folder-opened" style="cursor: pointer;font-size: 36px; color: orange" @click="changeDirectory(row)" />
        </template>
      </el-table-column>
      <el-table-column label="文件名" width="330" align="center">
        <template slot-scope="{row}">
          <span v-if="getContentType(row) !== 'application/x-directory'">{{ row.metadata.name }}</span>
          <span v-if="getContentType(row) === 'application/x-directory'" class="directory-item" @click="changeDirectory(row)">
            {{ row.metadata.name }}
          </span>
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
      <el-table-column label="文件路径" align="center">
        <template slot-scope="{row}">
          <span>  {{ row.filename }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <a v-if="getContentType(row) !== 'application/x-directory'" :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <el-button plain type="success" size="mini">查看</el-button>
          </a>
          <el-button v-if="getContentType(row) === 'application/x-directory'" plain type="success" size="mini" @click="changeDirectory(row)">查看</el-button>
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
        v-if="bucketDetail.full_token"
        drag
        :action="getUploadUrl()"
        :on-success="onUploadSuccess"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as fs from '@/api/file'
import { assert } from '@/utils/assert'
import { getAppFileUrl } from '@/api/file'
import { showError, showSuccess } from '@/utils/show'
import PathLink from './components/path-link.vue'

export default {
  name: 'BucketsListPage',
  components: { Pagination, PathLink },
  data() {
    return {
      bucket: null,
      bucketDetail: {
        name: '',
        mode: 0,
        full_token: '',
        read_token: ''
      },
      tableKey: 0,
      list: null,
      currentPath: '/',
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
  async created() {
    this.bucket = this.$route.params?.bucket

    const res = await fs.getOneBucket(this.bucket)
    this.bucketDetail = res.data
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
      const { limit, page } = this.listQuery
      // 执行数据查询
      const res = await fs.getFilesByBucketName(this.bucket, {
        limit,
        offset: (page - 1) * limit,
        path: this.currentPath,
        token: this.bucketDetail.full_token
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
    // 切换当前文件夹
    changeDirectory(row) {
      if (this.getContentType(row) !== 'application/x-directory') { return }

      this.currentPath = row.filename
      this.listQuery.page = 1
      this.getList()
    },
    // 当用户切换文件夹
    onChangeDirectory(data) {
      this.currentPath = data
      this.listQuery.page = 1
      this.getList()
    },
    // 显示上传表单
    showCreateForm() {
      this.dialogFormVisible = true
    },
    // 上传成功回调
    onUploadSuccess(event) {
      if (event?.code === 'ALREADY_EXISTED') {
        return showError('文件已存在！')
      }

      showSuccess('上传成功')
      this.getList()
    },
    // 删除请求
    async handleDelete(row) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const token = this.bucketDetail.full_token
      const r = await fs.deleteFile(this.bucket, row.filename, token)

      if (r.code === 'DIRECTORY_NOT_EMPTY') {
        return showError('不可删除非空文件夹')
      }

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
    // 新建目录
    async createDirectory() {
      await this.$prompt('请输入新文件夹名', '新建文件夹', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /[\w|\d|\-]{1,64}/,
        inputErrorMessage: '文件夹名只可包含字母、数字、下划线和中划线，长度在 1～64之间'
      }).then(async({ value }) => {
        const token = this.bucketDetail.full_token
        const res = await fs.makeDirectory(this.bucket, value, this.currentPath, token)
        if (res.code === 'ALREADY_EXISTED') {
          return showError('该文件夹已存在！')
        }

        this.getList()
      })
        .catch(err => {
          console.error(err)
        })
    },
    // 拼装文件下载 URL
    getFileUrl(file) {
      assert(file && file.filename, 'invalid file or filename')
      if (this.bucketDetail.mode > 0) {
        return getAppFileUrl(this.bucket, file.filename)
      }
      return getAppFileUrl(this.bucket, file.filename, this.bucketDetail.read_token)
    },
    // 拼装文件上传地址
    getUploadUrl() {
      assert(this.bucket, 'empty bucket name got')
      if (this.bucketDetail.mode === 2) {
        return getAppFileUrl(this.bucket, this.currentPath)
      }
      const token = this.bucketDetail.full_token
      return getAppFileUrl(this.bucket, this.currentPath, token)
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
      } else {
        return '-'
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

.directory-item {
  color: rgb(0, 89, 255);
  text-decoration: underline;
  cursor: pointer;
}
</style>
