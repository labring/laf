<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { ElMessageBox, ElNotification } from 'element-plus'
import dayjs from 'dayjs'
import * as oss from '~/api/oss'
import * as websiteAPI from '~/api/website'

const createFormRef = $ref<FormInstance>()
const editFormRef = $ref<FormInstance>()

let websites = $ref([])
let loading = $ref(false)
let buckets: any = $ref([])
let createForm = $ref({ label: '', bucket_name: '' })
let createFormVisible = $ref(false)
const createFormRules = $ref({ label: [{ required: true, message: '请输入名称', trigger: 'blur' }], bucket_name: [{ required: true, message: '请选择文件桶(Bucket)', trigger: 'blur' }] })
let editForm = $ref({ _id: '', label: '', cname: '', domain: '' })
let editFormVisible = $ref(false)
const editFormRules = $ref({ domain: [{ required: true, message: '请输入自定义域名', trigger: 'blur' }] })

function showCreateForm() {
  createFormVisible = true
}

function showEditForm(website: { _id: any; label: any; cname: any; domain: any }) {
  editFormVisible = true
  editForm = {
    _id: website._id,
    label: website.label,
    cname: website.cname,
    domain: website.domain,
  }
}

async function getWebsites() {
  loading = true

  const ret = await websiteAPI.getWebsites()
  if (ret.code) {
    ElMessage.error(ret.error)
    loading = false
    return
  }

  websites = ret.data.map((item: { created_at: any; updated_at: any; domain: any[] }) => {
    const _item: any = item
    _item.updated_at = dayjs(item.updated_at).format('YYYY-MM-DD HH:mm:ss')
    _item.domain = item.domain.join(',')
    return _item
  })
  loading = false
}

async function getBuckets() {
  const ret = await oss.getBuckets()

  if (ret.code) {
    ElMessage.error(ret.error)
    return
  }

  buckets = ret.data.filter((item: { mode: string }) => item.mode !== 'private')
}

async function createWebsite() {
  createFormRef.validate(async (valid: any) => {
    if (!valid)
      return

    loading = true
    const params = {
      label: createForm.label,
      bucket: createForm.bucket_name,
    }

    const ret = await websiteAPI.createWebsite(params)

    if (ret.code) {
      ElMessage.error(ret.error)
      loading = false
      return
    }

    loading = false
    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '创建成功',
    })
    await getWebsites()
    createForm = {
      label: '',
      bucket_name: '',
    }
    createFormVisible = false
  })
}

async function handleDelete(item: { _id: any }) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  loading = true
  await websiteAPI.deleteWebsite(item._id)

  ElMessage.success('删除成功！')
  getWebsites()
  loading = false
}

async function handleBindDomain() {
  editFormRef.validate(async (valid: any) => {
    if (!valid)
      return

    const REGEX_DOMAIN
      = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/
    if (REGEX_DOMAIN.test(editForm.domain) === false) {
      ElMessage.error('域名格式不正确')
      return
    }

    const params = {
      website_id: editForm._id,
      domain: editForm.domain,
    }
    loading = true
    const ret = await websiteAPI.bindDomain(params).finally(() => {
      loading = false
    })

    if (ret.code === 'DOMAIN_NOT_RESOLVEABLE')
      return ElMessage.error('解析失败，请先对该域名做 CNAME 解析')

    if (ret.code === 'DOMAIN_RESOLVED_ERROR')
      return ElMessage.error('解析错误，请使用正确的 CNAME 解析值')

    if (ret.code === 'ALREADY_EXISTED')
      return ElMessage.error('该域名已经被绑定')

    ElNotification({
      type: 'success',
      title: '操作成功',
      message: '绑定成功',
    })
    editFormVisible = false
    getWebsites()
    editForm = {
      _id: '',
      label: '',
      cname: '',
      domain: '',
    }
  })
}

onMounted(async () => {
  await getWebsites()
  await getBuckets()
})
</script>

<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container mb-24px">
      <el-button class="filter-item" type="default" icon="Search" @click="getWebsites">
        刷新
      </el-button>
      <el-button class="filter-item" type="primary" icon="Plus" @click="showCreateForm">
        创建网站托管
      </el-button>
    </div>

    <!-- 数据列表 -->
    <div class="data-container">
      <el-table v-loading="loading" :data="websites" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="label" label="名称" />
        <el-table-column prop="bucket_name" label="文件桶(Bucket)" />
        <el-table-column label="访问域名">
          <template #default="{ row }">
            <el-tag type="success">
              {{
                row.domain ? row.domain : row.cname
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            <span>{{ $filters.formatTime(row.created_at) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            <span>{{ $filters.formatTime(row.updated_at) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{ row }">
            <el-button type="success" @click="showEditForm(row)">
              自定义域名
            </el-button>
            <el-button type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 数据创建表单 -->
    <el-dialog v-model="createFormVisible" title="创建网站托管" width="500px">
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="100px">
        <el-form-item label="Label" prop="label">
          <el-input v-model="createForm.label" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="Bucket" prop="bucket_name">
          <el-select v-model="createForm.bucket_name" placeholder="请选择文件桶(Bucket)">
            <el-option v-for="bucket in buckets" :key="bucket.id" :label="bucket.name" :value="bucket.name" />
          </el-select>
          <span style="font-size: 12px; color: #666">
            可在“文件管理”创建 bucket</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" :loading="loading" @click="createWebsite">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 绑定自定义域名 -->
    <el-dialog v-model="editFormVisible" title="绑定自定义域名" width="500px">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="Label" prop="label">
          <el-input v-model="editForm.label" disabled />
        </el-form-item>
        <el-form-item label="CNAME" prop="cname">
          <Copy :text="editForm.cname" />
        </el-form-item>
        <el-form-item label="Domain" prop="domain">
          <el-input v-model="editForm.domain" placeholder="请输入自定义域名" />
        </el-form-item>
        <el-form-item label="">
          <div class="bind-dialog--tips">
            {{
              `请到您的域名服务商处，添加该域名的 "CNAME" 解析到 ${editForm.cname}，解析生效后即可绑定自定义域名。`
            }}
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editFormVisible = false">
            取消
          </el-button>
          <el-button type="primary" :loading="loading" @click="handleBindDomain">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 网站托管
meta:
  title: 网站托管
  index: 3-1 # menu sort by index
</route>
