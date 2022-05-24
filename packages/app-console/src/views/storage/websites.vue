<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button plain class="filter-item" type="default" icon="el-icon-search" @click="getWebsites">
        刷新
      </el-button>
      <el-button plain class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateForm">
        创建网站托管
      </el-button>
    </div>

    <!-- 数据列表 -->
    <div class="data-container">
      <el-table
        v-loading="loading"
        :data="websites"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column prop="label" label="名称" />
        <el-table-column prop="bucket_name" label="文件桶(Bucket)" />
        <el-table-column label="访问域名">
          <template slot-scope="{row}">
            <el-tag type="success">{{ row.domain ? row.domain : row.cname }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column prop="updated_at" label="更新时间" width="180" />
        <el-table-column label="操作" align="center">
          <template slot-scope="{row}">
            <el-button type="success" size="mini" @click="showEditForm(row)">自定义域名</el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 数据创建表单 -->
    <el-dialog title="创建网站托管" width="500px" :visible.sync="createFormVisible">
      <el-form ref="createForm" :model="createForm" :rules="createFormRules" label-width="100px">
        <el-form-item label="Label" prop="label">
          <el-input v-model="createForm.label" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="Bucket" prop="bucket_name">
          <el-select v-model="createForm.bucket_name" placeholder="请选择文件桶(Bucket)">
            <el-option
              v-for="bucket in buckets"
              :key="bucket.id"
              :label="bucket.name"
              :value="bucket.name"
            />
          </el-select>
          <span style="font-size: 12px;color: #666;"> 可在“文件管理”创建 bucket</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="createFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="createWebsite">
          确定
        </el-button>
      </div>
    </el-dialog>

    <!-- 绑定自定义域名 -->
    <el-dialog title="绑定自定义域名" width="500px" :visible.sync="editFormVisible">
      <el-form ref="editForm" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="Label" prop="label">
          <el-input v-model="editForm.label" disabled />
        </el-form-item>
        <el-form-item label="CNAME" prop="cname">
          <el-input
            v-model="editForm.cname"
            v-clipboard:message="editForm.cname"
            v-clipboard:success="onCopy"
            readonly
            suffix-icon="el-icon-document-copy"
          />

        </el-form-item>
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="editForm.domain" placeholder="请输入自定义域名" />
        </el-form-item>
        <el-form-item label="">
          <div class="bind-dialog--tips">
            {{ `请到您的域名服务商处，添加该域名的 "CNAME" 解析到 ${editForm.cname}，解析生效后即可绑定自定义域名。` }}
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="handleBindDomain">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import dayjs from 'dayjs'
import * as websiteAPI from '@/api/website'
import * as oss from '@/api/oss'
import { showError, showSuccess } from '@/utils/show'

export default {
  name: 'Hosting',
  data() {
    return {
      websites: [],
      loading: false,
      buckets: [],
      createForm: {
        label: '',
        bucket_name: ''
      },
      createFormVisible: false,
      createFormRules: {
        label: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        bucket_name: [{ required: true, message: '请选择文件桶(Bucket)', trigger: 'blur' }]
      },
      editForm: {
        _id: '',
        label: '',
        cname: '',
        domain: ''
      },
      editFormVisible: false,
      editFormRules: {
        domain: [{ required: true, message: '请输入自定义域名', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getWebsites()
    this.getBuckets()
  },
  methods: {
    showCreateForm() {
      this.createFormVisible = true
    },
    showEditForm(website) {
      this.editFormVisible = true
      this.editForm = {
        _id: website._id,
        label: website.label,
        cname: website.cname,
        domain: website.domain
      }
    },
    async getWebsites() {
      this.loading = true

      const ret = await websiteAPI.getWebsites()
      if (ret.code) {
        showError(ret.error)
        this.loading = false
        return
      }

      this.websites = ret.data.map(item => {
        item.created_at = dayjs(item.created_at).format('YYYY-MM-DD HH:mm:ss')
        item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
        item.domain = item.domain.join(',')
        return item
      })
      this.loading = false
    },
    async getBuckets() {
      const ret = await oss.getBuckets()

      if (ret.code) {
        showError(ret.error)
        return
      }

      this.buckets = ret.data.filter(item => item.mode !== 'private')
    },
    async createWebsite() {
      this.$refs.createForm.validate(async valid => {
        if (!valid) return

        this.loading = true
        const params = {
          label: this.createForm.label,
          bucket: this.createForm.bucket_name
        }

        const ret = await websiteAPI.createWebsite(params)

        if (ret.code) {
          showError(ret.error)
          this.loading = false
          return
        }

        this.loading = false
        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功'
        })
        this.getWebsites()
        this.createForm = {
          label: '',
          bucket_name: ''
        }
        this.createFormVisible = false
      })
    },
    async handleDelete(item) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      this.loading = true
      await websiteAPI.deleteWebsite(item._id)

      showSuccess('删除成功！')
      this.getWebsites()
      this.loading = false
    },
    async handleBindDomain() {
      this.$refs.editForm.validate(async valid => {
        if (!valid) return

        const REGEX_DOMAIN = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
        if (REGEX_DOMAIN.test(this.editForm.domain) === false) {
          showError('域名格式不正确')
          return
        }

        const params = {
          website_id: this.editForm._id,
          domain: this.editForm.domain
        }
        this.loading = true
        const ret = await websiteAPI.bindDomain(params)
          .finally(() => { this.loading = false })

        if (ret.code === 'DOMAIN_NOT_RESOLVEABLE') {
          return showError('解析失败，请先对该域名做 CNAME 解析')
        }

        if (ret.code === 'DOMAIN_RESOLVED_ERROR') {
          return showError('解析错误，请使用正确的 CNAME 解析值')
        }

        if (ret.code === 'ALREADY_EXISTED') {
          return showError('该域名已经被绑定')
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '绑定成功'
        })
        this.editFormVisible = false
        this.getWebsites()
        this.editForm = {
          _id: '',
          label: '',
          cname: '',
          domain: ''
        }
      })
    },
    onCopy() {
      this.$message.success('已复制')
    }
  }
}
</script>

<style scoped lang="scss">
.bind-dialog--tips {
  font-size: 14px;
  color: 666;
  line-height: 1.6;
}
</style>
