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

      <el-button plain class="filter-item" type="primary" :loading="acLoading" @click="handleUpdateAC()">
        获取服务账号
      </el-button>

      <div class="filter-item" style="margin-left: 10px">
        <el-tooltip :content="oss_external_endpoint" placement="top">
          <el-tag type="info">OSS EndPoint
            <i
              v-clipboard:message="oss_external_endpoint"
              v-clipboard:success="onCopy"
              style="margin-left: 3px;"
              class="el-icon-document-copy copy-btn"
            />
          </el-tag>
        </el-tooltip>
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
      <el-table-column label="文件桶(Bucket)" width="200">
        <template slot-scope="{row}">
          <span>{{app.appid}}-{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="容量(Quota)" width="200">
        <template slot-scope="{row}">
          <span>{{ byte2gb(row.quota) }} GB</span>
        </template>
      </el-table-column>
      <el-table-column label="默认权限" align="center" width="100">
        <template slot-scope="{row}">
          <span v-if="row.mode === mode.PRIVATE">
            <el-tag type="info" size="small" effect="plain">私有</el-tag>
          </span>
          <span v-if="row.mode === mode.PUBLIC_READ">
            <el-tag type="primary" size="small" effect="plain">公共读</el-tag>
          </span>
          <span v-if="row.mode === mode.PUBLIC_READ_WRITE">
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
    <el-dialog width="600px" :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="100px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="文件桶名" prop="name">
          <el-input v-model="form.name" :disabled="dialogStatus==='update'" placeholder="唯一标识" >
            <template #prepend>
              {{app.appid}}-
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="默认权限" prop="mode">
          <el-select v-model="form.mode" placeholder="">
            <el-option label="私有" :value="mode.PRIVATE" />
            <el-option label="公共读" :value="mode.PUBLIC_READ" />
            <el-option label="公共读写" :value="mode.PUBLIC_READ_WRITE" />
          </el-select>
        </el-form-item>
        <el-form-item label="容量" prop="quota">
          <el-input
            v-model.number="form.quota"
            type="number"
            :step="1"
            :min="1"
            oninput="value=value.replace(/[^0-9]/g,'')"
            style="width: 140px;"
            placeholder="容量，单位：GB"
          >
            <template slot="append">GB</template>
          </el-input>
          <span> 总容量 {{ totalQuota }} GB，剩余 {{ freeQuota }} GB</span>
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

    <el-dialog width="800px" title="服务账号" :visible.sync="dialogACFormVisible">

      <el-form

        label-position="left"
        label-width="120px"
        style="width: 600px; margin-left:50px;"
      >
        <el-alert title="服务账号只会显示一次，请自行保存" type="error" :closable="false" />
        <br>
        <el-form-item label="Access Key">
          <div>
            {{ access_key }}
            <i
              v-clipboard:message="access_key"
              v-clipboard:success="onCopy"
              style="margin-left: 3px;"
              class="el-icon-document-copy copy-btn"
            />
          </div>
        </el-form-item>

        <el-form-item label="Access Secret">
          <div>
            {{ access_secret }}
            <i
              v-clipboard:message="access_secret"
              v-clipboard:success="onCopy"
              style="margin-left: 3px;"
              class="el-icon-document-copy copy-btn"
            />
          </div>
        </el-form-item>
      </el-form>

    </el-dialog>

  </div>
</template>

<script>
import * as oss from '@/api/oss'
import { assert } from '@/utils/assert'
// import { byte2gb, gb2byte } from '@/utils/file'
import store from '@/store'
import { showError, showSuccess } from '@/utils/show'

const MODE = {
  PRIVATE: 'private',
  PUBLIC_READ: 'public-read',
  PUBLIC_READ_WRITE: 'public-read-write'
}

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: '',
    mode: MODE.PRIVATE,
    quota: 1
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: 'Bucket 名字不可为空', trigger: 'blur' }],
  mode: [{ required: true, message: 'Bucket 权限为必选', trigger: 'blur' }],
  quota: [{ required: true, message: 'Bucket 容量为必选', trigger: 'blur' }]
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

      dialogACFormVisible: false,
      acLoading: false,
      access_key: '',
      access_secret: '',
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: formRules,
      downloadLoading: false,
      mode: MODE,
      freeQuota: 0
    }
  },
  computed: {
    // 总存储容量 GB
    totalQuota() {
      const totalQuota = store.state.app.spec.spec.storage_capacity || 0
      return this.byte2gb(totalQuota)
    },
    oss_external_endpoint() {
      return store.state.app.oss_external_endpoint
    },
    oss_internal_endpoint() {
      return store.state.app.oss_internal_endpoint
    },
    app() {
      return this.$store.state.app?.application
    }
  },
  created() {
    this.getList()
  },
  methods: {
    byte2gb(byte) {
      return Math.floor(byte / 1024 / 1024 / 1024)
    },
    gb2byte(gb) {
      return gb * 1024 * 1024 * 1024
    },
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true

      // 执行数据查询
      const ret = await oss.getBuckets().catch(() => { this.listLoading = false })
      assert(ret.code === 0, 'get file buckets got error')

      const usedQuota = ret.data.reduce((total, bucket) => {
        return total + bucket.quota
      }, 0)
      this.freeQuota = this.totalQuota - this.byte2gb(usedQuota)

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
        const isNameValid = /^[a-z0-9]{3,16}$/g.test(this.form.name)
        if (!isNameValid) {
          return showError('Bucket 名称长度必须在 3～16 之间，且只能包含小写字母、数字')
        }

        if (this.freeQuota < this.form.quota) {
          return showError('所有Bucket容量相加不能超过总容量')
        }
        const quota = this.gb2byte(this.form.quota)
        // 执行创建请求
        const r = await oss.createBucket(this.form.name, this.form.mode, quota)

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
      this.form = { ...row, quota: this.byte2gb(row.quota) }
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

        // 检查quota是否可用
        const existedQuota = this.list.find(bucket => bucket.name === this.form.name).quota
        const freeQuota = this.freeQuota + this.byte2gb(existedQuota)
        if (freeQuota < this.form.quota) {
          return showError('所有Bucket容量相加不能超过总容量')
        }
        const quota = this.gb2byte(this.form.quota)

        // 执行更新请求
        const r = await oss.updateBucket(this.form.name, this.form.mode, quota)

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
      const r = await oss.deleteBucket(row.name)

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

      this.getList()
    },
    // 获取 bucket 地址
    getBucketUrl(bucketName) {
      return oss.getBucketSecondaryUrl(bucketName)
    },
    // 查看详情
    async handleShowDetail(row) {
      // 跳转到详情页
      this.$router.push(`files/${row.name}`)
    },
    // 更新ac
    async handleUpdateAC() {
      await this.$confirm('服务账号重置以后，之前的服务账号会失效，确定重置？', '服务账号重置', {
        confirmButtonText: '重置',
        cancelButtonText: '取消',
        type: 'warning'
      })

      this.acLoading = true

      const ret = await oss.updateAC()

      console.log(ret)

      if (ret.code) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: ret.error
        })
      }
      this.acLoading = false
      this.dialogACFormVisible = true
      console.log(ret.data)
      this.access_key = ret.data.access_key
      this.access_secret = ret.data.access_secret
    },
    onCopy() {
      this.$message.success('已复制')
    }
  }
}
</script>
