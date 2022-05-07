<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-refresh" @click="handleFilter">
        刷新
      </el-button>
      <el-dropdown trigger="click" size="mini" class="filter-item" style="margin-left: 10px; margin-right: 10px;" @command="handleUploadCommand">
        <el-button size="mini" plain type="primary">
          <i class="el-icon-upload el-icon--left" />上传<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="uploadFile">上传文件</el-dropdown-item>
          <el-dropdown-item command="uploadFolder">上传文件夹</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <el-button size="mini" plain class="filter-item" type="primary" icon="el-icon-new" @click="createDirectory">
        新建文件夹
      </el-button>
      <div class="filter-item" style="margin-left: 20px;">
        <span style="font-size: 16px;color: gray; margin-right: 5px;">当前:</span>
        <path-link :path="currentPath" :bucket="bucket" @change="onChangeDirectory" />
      </div>
      <div class="filter-item tips">
        <span>bucket容量：{{ bucketQuota }} </span>
        <span>已用容量：{{ bucketSize }} </span>
        <span>文件数量：{{ bucketObjects }} </span>
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
      size="mini"
    >
      <el-table-column label="文件" align="center" width="140">
        <template slot-scope="{row}">
          <a v-if="!row.Prefix" :href="getFileUrl(row)" target="blank">
            <i v-if="isImage(row)" class="el-icon-picture-outline" style="font-size: 40px" />
            <i v-else-if="isVideo(row)" class="el-icon-video-play" style="font-size: 40px" />
            <i v-else-if="row.Prefix" class="el-icon-folder-opened" style="font-size: 36px; color: orange" />
            <i v-else class="el-icon-paperclip" style="font-size: 40px" />
          </a>
          <i v-if="row.Prefix" class="el-icon-folder-opened" style="cursor: pointer;font-size: 36px; color: orange" @click="changeDirectory(row)" />
        </template>
      </el-table-column>
      <el-table-column label="文件名" width="330" align="left">
        <template slot-scope="{row}">
          <span v-if="!row.Prefix">{{ getFileName(row) }}</span>
          <span v-if="row.Prefix" class="directory-item" @click="changeDirectory(row)">
            {{ row.Prefix }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="大小" align="center" width="70">
        <template slot-scope="{row}">
          <span>{{ getFileSize(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="140" align="center">
        <template slot-scope="{row}">
          <span v-if="row.LastModified">{{ Date.parse(row.LastModified) | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="文件路径" align="center">
        <template slot-scope="{row}">
          <span>  {{ row.Prefix ? '-' : row.Key }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.Prefix" plain type="success" size="mini" @click="changeDirectory(row)">查看</el-button>
          <a v-if="!row.Prefix" :href="getFileUrl(row)" target="blank" style="margin-right: 8px">
            <el-button plain type="success" size="mini">查看</el-button>
          </a>
          <el-button :disabled="!!row.Prefix" plain size="mini" type="danger" @click="handleDelete(row)">
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
    <el-dialog :title="uploadCommand === 'uploadFile' ? '上传文件' : '上传文件夹'" width="400px" :visible.sync="dialogFormVisible" @close="uploadFileList = []">
      <el-upload
        v-if="bucketDetail.credentials"
        drag
        multiple
        action=""
        :show-file-list="true"
        :file-list="uploadFileList"
        :auto-upload="true"
        :http-request="handleUploadFile"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">
          {{ uploadCommand === 'uploadFile' ? '将文件拖到此处，或' : '' }} <em>点击上传</em>
        </div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as oss from '@/api/oss'
import { assert } from '@/utils/assert'
import { showError, showSuccess } from '@/utils/show'
import PathLink from './components/path-link.vue'
import { byte2GbOrMb } from '@/utils/file'

export default {
  name: 'BucketsListPage',
  components: { Pagination, PathLink },
  data() {
    return {
      bucket: null,
      bucketDetail: {
        name: '',
        mode: 'private',
        full_token: '',
        read_token: '',
        credentials: {},
        objects: 0,
        size: 0,
        quota: 0
      },
      tableKey: 0,
      list: null,
      currentPath: '/',
      total: 0,
      listLoading: false,
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
      downloadLoading: false,
      uploadCommand: 'uploadFile',
      uploadFileList: []
    }
  },
  computed: {
    bucketQuota() {
      return this.bucketDetail.quota ? byte2GbOrMb(this.bucketDetail.quota) : 0
    },
    bucketSize() {
      return this.bucketDetail.size ? byte2GbOrMb(this.bucketDetail.size) : 0
    },
    bucketObjects() {
      return this.bucketDetail.objects
    }
  },
  async created() {
    this.bucket = this.$route.params?.bucket

    const res = await oss.getOneBucket(this.bucket)
    this.bucketDetail = res.data
    this.getList()
    this.setTagViewTitle()
  },
  methods: {
    /**
     * 获取数据列表
     */
    getList(upload = false) {
      if (this.listLoading) return
      this.listLoading = true

      const getList = async() => {
        const res = await oss.getFilesByBucketName(this.bucket, {
          marker: undefined,
          prefix: this.currentPath,
          credentials: this.bucketDetail.credentials
        }).finally(() => { this.listLoading = false })

        const files = res.Contents || []
        const dirs = res.CommonPrefixes || []
        this.list = [...files, ...dirs]
        this.listLoading = false
      }

      // 对多文件或文件夹上传做节流处理
      upload ? setTimeout(getList, 1000) : getList()
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 切换当前文件夹
    changeDirectory(row) {
      if (!row.Prefix) { return }

      this.currentPath = row.Prefix
      this.listQuery.page = 1
      this.getList()
    },
    // 当用户切换文件夹
    onChangeDirectory(data) {
      this.currentPath = data
      this.listQuery.page = 1
      this.getList()
    },
    // 删除请求
    async handleDelete(row) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await oss.deleteAppFile(this.bucket, row.Key, this.bucketDetail.credentials)

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
      await this.$prompt('', '请输入新文件夹名', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /^[^\\\/\:\*\?\"\<\>\|\.]+$/,
        inputErrorMessage: '文件夹不能包含 \\\ \/ : * ? \" < > | 这些非法字符'
      }).then(async({ value }) => {
        this.currentPath = this.currentPath + value + '/'
        this.getList()
      })
        .catch(err => {
          console.error(err)
        })
    },
    // 拼装文件下载 URL
    getFileUrl(file) {
      assert(file && file.Key, 'invalid file or filename')
      const url = oss.getAppFileUrl(this.bucket, file.Key, this.bucketDetail.credentials)
      console.log('getFileURl', url)
      return url
    },
    getFileName(file) {
      assert(file && file.Key, 'invalid file or filename')
      return file.Key.split('/').at(-1)
    },
    handleUploadCommand(command) {
      this.dialogFormVisible = true
      this.uploadCommand = command
      if (command === 'uploadFolder') {
        this.$nextTick(() => {
          document.getElementsByClassName('el-upload__input')[0].webkitdirectory = true
        })
      } else {
        this.$nextTick(() => {
          document.getElementsByClassName('el-upload__input')[0].webkitdirectory = false
        })
      }
    },
    async handleUploadFile(param) {
      const file = param.file
      const currentPath = this.currentPath === '/' ? '' : this.currentPath
      const fileName = file.webkitRelativePath ? file.webkitRelativePath : file.name
      const key = currentPath + fileName
      const res = await oss.uploadAppFile(this.bucket, key, file, this.bucketDetail.credentials, { contentType: file.type })
      if (res.$response?.httpResponse?.statusCode !== 200) {
        return showError('文件上传失败：' + key)
      }

      showSuccess('文件上传成功: ' + key)
      this.getList(true)
    },
    // 判断是否为图片类型
    isImage(row) {
      const key = row.Key?.toLowerCase()
      return key?.endsWith('.png') || key?.endsWith('.jpeg') || key?.endsWith('.jpg') || key?.endsWith('.gif')
    },
    // 判断是否为视频类型
    isVideo(row) {
      const key = row.Key?.toLowerCase()
      return key?.endsWith('.mp4') || key?.endsWith('.mov') || key?.endsWith('.mpeg') || key?.endsWith('.flv') || key?.endsWith('.avi')
    },
    // 获取文件显示大小
    getFileSize(file) {
      const length = file.Size ?? 0
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
.filter-container .tips {
  font-size: 14px; color: #333;position: absolute;right: 20px;
}
.filter-container .tips span {
  margin-right: 10px;
}
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
