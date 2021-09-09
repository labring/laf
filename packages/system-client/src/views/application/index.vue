<template>
  <div class="application-container">
    <div class="controls">
      <el-button plain type="default" size="mini" icon="el-icon-refresh" @click="loadApps">
        刷新
      </el-button>
      <el-button plain type="primary" size="mini" icon="el-icon-plus" @click="showCreateForm">
        新建
      </el-button>
    </div>

    <!-- My created apps -->
    <div class="app-group">
      <div class="app-group-title">我创建的应用</div>
      <el-table v-loading="loading" empty-text="还没有创建应用" :data="applications.created" style="width: 100%;margin-top:10px;" stripe>
        <el-table-column align="center" label="App ID" width="340">
          <template slot-scope="scope">
            <div class="table-row">
              <div> {{ scope.row.appid }}</div>
              <i v-clipboard:message="scope.row.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用名" width="400">
          <template slot-scope="{row}">
            <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="Status" width="200">
          <template slot-scope="scope">
            {{ scope.row.status }}
          </template>
        </el-table-column>
        <el-table-column label="服务启停" align="left" width="200" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button v-if="row.status !== 'running'" :loading="serviceLoading" plain type="success" size="mini" @click="startApp(row)">
              启动
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading" plain type="danger" size="mini" @click="stopApp(row)">
              停止
            </el-button>
            <el-tooltip content="仅清除应用服务实例，并[不会]删除应用或数据，请放心清除" effect="light" placement="bottom">
              <el-button v-if="row.status === 'stopped'" :loading="serviceLoading" plain type="default" size="mini" @click="removeAppService(row)">
                清除
              </el-button>
            </el-tooltip>

          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="{row}">
            <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="320" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button type="success" size="mini" @click="toDetail(row)">
              开发管理
            </el-button>
            <el-button type="default" size="mini" @click="exportApp(row)">
              导出
            </el-button>
            <el-button type="default" size="mini" @click="showImportForm(row)">
              导入
            </el-button>
            <el-button plain size="mini" type="default" @click="deleteApp(row)">
              释放
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    </div>

    <!-- My joined apps -->
    <div class="app-group">
      <div class="app-group-title">我加入的应用</div>
      <el-table v-loading="loading" empty-text="还没有加入的应用" :data="applications.joined" style="width: 100%;margin-top:10px;" stripe>
        <el-table-column align="center" label="App ID" width="340">
          <template slot-scope="scope">
            <div class="table-row">
              <div> {{ scope.row.appid }}</div>
              <i v-clipboard:message="scope.row.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用名" width="400">
          <template slot-scope="{row}">
            <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="left" label="Status" width="200">
          <template slot-scope="scope">
            {{ scope.row.status }}
          </template>
        </el-table-column>
        <el-table-column label="服务启停" align="left" width="200" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button v-if="row.status !== 'running'" :loading="serviceLoading" plain type="success" size="mini" @click="startApp(row)">
              启动
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading" plain type="danger" size="mini" @click="stopApp(row)">
              停止
            </el-button>
            <el-tooltip content="仅清除应用服务实例，并[不会]删除应用或数据，请放心清除" effect="light" placement="bottom">
              <el-button v-if="row.status === 'stopped'" :loading="serviceLoading" plain type="default" size="mini" @click="removeAppService(row)">
                清除
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center">
          <template slot-scope="{row}">
            <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="320" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button type="success" size="mini" @click="toDetail(row)">
              开发管理
            </el-button>
            <el-button type="default" size="mini" @click="exportApp(row)">
              导出
            </el-button>
            <el-button type="default" size="mini" @click="showImportForm(row)">
              导入
            </el-button>
            <el-button plain size="mini" type="default" @click="deleteApp(row)">
              释放
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建应用表单 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="120px"
        style="width: 400px; margin-left:20px;"
      >
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="form.name" placeholder="应用名称" />
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

    <!-- 导入应用对话框 -->
    <el-dialog v-if="importForm.app" title="导入应用" :visible.sync="dialogImportVisible">
      <el-form
        ref="importForm"
        :rules="importFormRules"
        :model="importForm"
        label-position="left"
        label-width="120px"
        style="width: 300px; margin-left:20px;"
      >
        <el-form-item label="应用" prop="app">
          {{ importForm.app.name }}
        </el-form-item>
        <el-form-item label="选择应用文件" prop="file">
          <el-upload
            ref="uploader"
            action=""
            :auto-upload="false"
            :multiple="false"
            :show-file-list="true"
            accept=".json"
            :limit="1"
            :on-change="onImportFileChanged"
          >
            <el-button slot="trigger" plain size="mini" type="primary">选取导入文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogImportVisible = false">
          取消
        </el-button>
        <el-button :loading="loading" type="primary" @click="handleImportApp">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createApplication, getMyApplications, startApplicationService, stopApplicationService, removeApplicationService, updateApplication, removeApplication, exportApplication, importApplication } from '@/api/application'
import { showError, showSuccess } from '@/utils/show'
import { exportRawText, readTextFromFile } from '@/utils/file'
import { parseTime } from '@/utils'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    appid: undefined,
    name: ''
  }
}

const formRules = {
  name: [{ required: true, message: '应用名不可为空', trigger: 'blur' }]
}

const importFormRules = {
  app: [{ required: true, message: '没选择应用', trigger: 'blur' }],
  file: [{ required: true, message: '请选择导入文件', trigger: 'blur' }]
}

export default {
  name: 'Applications',
  components: { },
  data() {
    return {
      applications: {
        created: [],
        joined: []
      },
      loading: false,
      form: getDefaultFormValue(),
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: formRules,
      importFormRules,
      dialogImportVisible: false,
      importForm: {
        app: null,
        file: null
      },
      serviceLoading: false
    }
  },
  async created() {
    this.loadApps()
  },
  methods: {
    async loadApps() {
      this.loading = true
      const res = await getMyApplications()
        .finally(() => { this.loading = false })
      const { created, joined } = res.data
      this.applications.created = created
      this.applications.joined = joined
    },
    toDetail(app) {
      const route_url = this.$router.resolve({
        path: `/app/${app.appid}/dashboard/index`
      })
      window.open(route_url.href, '_blank')
      // this.$router.push({
      //   path: `/app/${app.appid}/dashboard/index`
      // })
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
        const data = Object.assign({}, this.form)

        // 执行创建请求
        const res = await createApplication({ name: data.name })
        if (!res.data?.id) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '创建失败！' + res.error
          })
          return
        }
        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '创建成功！'
        })

        this.loadApps()
        this.dialogFormVisible = false
      })
    },
    // 显示更新表单
    showUpdateForm(row) {
      this.form = Object.assign(getDefaultFormValue(), row) // copy obj
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

        // 执行创建请求
        const res = await updateApplication(this.form.appid, { name: this.form.name })
        if (!res.data.ok) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '更新失败！' + res.error
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '更新成功！'
        })

        this.loadApps()
        this.dialogFormVisible = false
      })
    },
    async deleteApp(row) {
      await this.$confirm('应用被删除后，暂不可恢复，确定释放？', '确认释放应用？')
      console.log(row)
      if (row.status !== 'cleared' && row.status !== 'created') { return showError('请先停止并清除该应用的服务') }
      this.loading = true

      const res = await removeApplication(row.appid)
        .finally(() => { this.loading = false })

      if (res.error) showError(res.error)
      showSuccess('应用已释放: ' + row.name)
      this.loadApps()
    },
    onCopy() {
      this.$message.success('已复制')
    },
    async startApp(app) {
      this.serviceLoading = true
      const res = await startApplicationService(app.appid)
        .finally(() => { this.serviceLoading = false })
      if (res.data) {
        this.$notify.success('启动应用成功')
        this.loadApps()
        return
      }
    },
    async stopApp(app) {
      await this.$confirm('确认要停止应用服务？', '服务操作确认')
      this.serviceLoading = true
      const res = await stopApplicationService(app.appid)
        .finally(() => { this.serviceLoading = false })
      if (res.data) {
        this.$notify.success('停止应用成功')
        this.loadApps()
        return
      }
    },
    async removeAppService(app) {
      await this.$confirm('确认要删除应用服务？', '服务操作确认')
      this.serviceLoading = true
      const res = await removeApplicationService(app.appid)
        .finally(() => { this.serviceLoading = false })
      if (res.data) {
        this.$notify.success('删除应用服务成功')
        this.loadApps()
        return
      }
    },
    async exportApp(app) {
      this.loading = true
      const res = await exportApplication(app.appid)
        .finally(() => { this.loading = false })

      const data = JSON.stringify(res)
      const time = parseTime(Date.now(), '{y}{m}{d}{h}{i}{s}')
      const filename = `${app.name}_${time}.json`
      exportRawText(filename, data)
    },
    showImportForm(app) {
      this.importForm = { app, file: null }
      this.dialogImportVisible = true
      this.$nextTick(() => {
        this.$refs['importForm'].clearValidate()
        this.$refs['uploader'].clearFiles()
      })
    },
    onImportFileChanged(data) {
      const file = data.raw
      this.importForm.file = file
    },
    async handleImportApp() {
      this.loading = true
      try {
        const text = await readTextFromFile(this.importForm.file)
        const import_data = JSON.parse(text)
        const appid = this.importForm.app?.appid
        const res = await importApplication(appid, import_data)
        if (res.error) {
          return showError('导入失败:' + res.error)
        }

        showSuccess('导入成功!')
        this.importForm = { app: null, file: null }
        this.dialogImportVisible = false
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.application-container {
  padding: 20px;
  width: calc(100vw - 30px);
  margin: 15px auto;
}

.table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-secret {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 240px;
}

.copy-btn {
    display: block;
    font-size: 16px;
    margin-left: 10px;
    cursor: pointer;
}

.app-group {
  margin-top: 20px;
  border: 1px solid rgb(236, 233, 233);
  box-shadow: -1px -1px 5px 0 rgb(0 0 0 / 10%);
  background: white;
}

.app-group-title {
  color: rgb(85, 83, 83);
  padding: 10px;
}
</style>
