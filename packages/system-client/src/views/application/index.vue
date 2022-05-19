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
        <el-table-column align="center" label="App ID" min-width="100">
          <template slot-scope="scope">
            <div class="table-row">
              <el-tooltip :content="scope.row.appid" effect="light" placement="top">
                <div class="table-column-text"> {{ scope.row.appid }}</div>
              </el-tooltip>
              <i v-clipboard:message="scope.row.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用名" min-width="120">
          <template slot-scope="{row}">
            <span class="link-type table-column-text" @click="showUpdateForm(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用规格" min-width="80">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.spec" placement="top">
              <div slot="content">{{ formatSpec(scope.row.spec.spec).text }}</div>
              <el-tag type="info">{{ formatSpec(scope.row.spec.spec).label }}</el-tag>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="服务版本" min-width="80">
          <template slot-scope="scope">
            {{ getRuntimeVersion(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="服务启停" align="center" width="240" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button v-if="row.status === 'stopped' || row.status === 'created'" :loading="serviceLoading[row.appid]" plain type="success" size="mini" @click="startApp(row)">
              启动
            </el-button>
            <el-button v-if="row.status === 'prepared_start'" :loading="true" plain type="info" size="mini">
              准备启动
            </el-button>
            <el-button v-if="row.status === 'starting'" :loading="true" plain type="info" size="mini">
              正在启动
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="danger" size="mini" @click="stopApp(row)">
              停止
            </el-button>
            <el-button v-if="row.status === 'prepared_stop'" :loading="true" plain type="info" size="mini">
              准备停止
            </el-button>
            <el-button v-if="row.status === 'stopping'" :loading="true" plain type="info" size="mini">
              停止中
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="default" size="mini" @click="restartApp(row)">
              重启
            </el-button>
            <el-button v-if="row.status === 'prepared_restart'" :loading="true" plain type="info" size="mini">
              准备重启
            </el-button>
            <el-button v-if="row.status === 'restarting'" :loading="true" plain type="info" size="mini">
              重启中
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" min-width="120">
          <template slot-scope="{row}">
            <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="280" class-name="small-padding">
          <template slot-scope="{row}">
            <el-tooltip content="编写云函数、查看日志、管理数据库、文件、成员协作等" effect="light" placement="top">
              <el-button type="success" size="mini" @click="toDetail(row)">
                开发
              </el-button>
            </el-tooltip>
            <el-button type="default" size="mini" @click="exportApp(row)">
              导出
            </el-button>
            <el-button type="default" size="mini" @click="showImportForm(row)">
              导入
            </el-button>
            <el-tooltip content="释放即完全删除应用，暂不可恢复，谨慎操作，仅应用创建者可执行此操作!" effect="light" placement="left">
              <el-button :disabled="row.status === 'running'" plain size="mini" type="default" @click="deleteApp(row)">
                释放
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

    </div>

    <!-- My joined apps -->
    <div class="app-group">
      <div class="app-group-title">我加入的应用</div>
      <el-table v-loading="loading" empty-text="还没有加入的应用" :data="applications.joined" style="width: 100%;margin-top:10px;" stripe>
        <el-table-column align="center" label="App ID" min-width="100">
          <template slot-scope="scope">
            <div class="table-row">
              <el-tooltip :content="scope.row.appid" effect="light" placement="top">
                <div class="table-column-text"> {{ scope.row.appid }}</div>
              </el-tooltip>
              <i v-clipboard:message="scope.row.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
            </div>
          </template>
        </el-table-column>
        <el-table-column align="center" label="应用名" min-width="120">
          <template slot-scope="{row}">
            <span class="link-type table-column-text" @click="showUpdateForm(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="规格" min-width="80">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.spec" placement="top">
              <div slot="content">{{ formatSpec(scope.row.spec.spec).text }}</div>
              <el-tag type="info">{{ formatSpec(scope.row.spec.spec).label }}</el-tag>
            </el-tooltip>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="服务版本" min-width="80">
          <template slot-scope="scope">
            {{ getRuntimeVersion(scope.row) }}
          </template>
        </el-table-column>
        <el-table-column label="服务启停" align="center" width="240" class-name="small-padding">
          <template slot-scope="{row}">
            <el-button v-if="row.status === 'stopped' || row.status === 'created'" :loading="serviceLoading[row.appid]" plain type="success" size="mini" @click="startApp(row)">
              启动
            </el-button>
            <el-button v-if="row.status === 'prepared_start'" :loading="true" plain type="info" size="mini">
              准备启动
            </el-button>
            <el-button v-if="row.status === 'starting'" :loading="true" plain type="info" size="mini">
              正在启动
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="danger" size="mini" @click="stopApp(row)">
              停止
            </el-button>
            <el-button v-if="row.status === 'prepared_stop'" :loading="true" plain type="info" size="mini">
              准备停止
            </el-button>
            <el-button v-if="row.status === 'stopping'" :loading="true" plain type="info" size="mini">
              停止中
            </el-button>
            <el-button v-if="row.status === 'running'" :loading="serviceLoading[row.appid]" plain type="default" size="mini" @click="restartApp(row)">
              重启
            </el-button>
            <el-button v-if="row.status === 'prepared_restart'" :loading="true" plain type="info" size="mini">
              准备重启
            </el-button>
            <el-button v-if="row.status === 'restarting'" :loading="true" plain type="info" size="mini">
              重启中
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" min-width="120">
          <template slot-scope="{row}">
            <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" align="center" width="280" class-name="small-padding">
          <template slot-scope="{row}">
            <el-tooltip content="编写云函数、查看日志、管理数据库、文件、成员协作等" effect="light" placement="top">
              <el-button type="success" size="mini" @click="toDetail(row)">
                开发
              </el-button>
            </el-tooltip>
            <el-button type="default" size="mini" @click="exportApp(row)">
              导出
            </el-button>
            <el-button type="default" size="mini" @click="showImportForm(row)">
              导入
            </el-button>
            <el-tooltip content="释放即完全删除应用，暂不可恢复，谨慎操作!" effect="light" placement="left">
              <el-button :disabled="row.status === 'running'" plain size="mini" type="default" @click="deleteApp(row)">
                释放
              </el-button>
            </el-tooltip>
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
        <el-form-item label="选择规格" prop="spec">
          <el-radio-group v-model="form.spec">
            <el-tooltip v-for="spec in specs" :key="spec.name" placement="bottom">
              <div slot="content">{{ formatSpec(spec).text }}</div>
              <el-radio :label="spec.name" border>
                <div class="spec-card" style="display:inline-block;">
                  {{ spec.label }}
                </div>
              </el-radio>
            </el-tooltip>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="loading" @click="dialogStatus==='create'?handleCreate():handleUpdate()">
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
            accept=".lapp"
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
import { createApplication, getMyApplications, startApplicationInstance, stopApplicationInstance, restartApplicationInstance, updateApplication, removeApplication, exportApplication, importApplication, openAppConsole, getSpecs } from '@/api/application'
import { showError, showInfo, showSuccess } from '@/utils/show'
import { exportRawBlob } from '@/utils/file'
import { parseTime } from '@/utils'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    appid: undefined,
    name: '',
    spec: ''
  }
}

const formRules = {
  name: [{ required: true, message: '应用名不可为空', trigger: 'blur' }],
  spec: [{ required: true, message: '请选择应用规格', trigger: 'blur' }]
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
      specs: [],
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
      serviceLoading: {},
      interval: null
    }
  },
  async created() {
    this.loadApps()
    this.interval = setInterval(() => { this.getApplications(true) }, 5000)
  },
  beforeDestroy() {
    if (this.interval) clearInterval(this.interval)
  },
  methods: {
    loadApps() {
      this.getApplications()
      this.getSpecs()
    },
    async getSpecs() {
      const specs = await getSpecs()
      this.specs = specs.data
    },
    async getApplications(interval = false) {
      if (!interval) this.loading = true
      const res = await getMyApplications()
        .finally(() => {
          if (!interval) this.loading = false
        })
      const { created, joined } = res.data
      this.applications.created = created
      this.applications.joined = joined
    },
    toDetail(app) {
      if (app.status !== 'running') {
        return showInfo('请先启动应用服务！')
      }
      openAppConsole(app)
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
        this.loading = true
        const res = await createApplication({ name: data.name, spec: data.spec })
          .finally(() => { this.loading = false })
        if (!res.data?.appid) {
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

        this.$set(this.serviceLoading, res.data.appid, true)
        this.startApp(res.data)
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

        this.loading = true
        // 执行创建请求
        const res = await updateApplication(this.form.appid, { name: this.form.name })
          .finally(() => { this.loading = false })
        if (res.error) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '更新失败！' + res.error
          })
          return
        }

        showSuccess('更新成功！')

        this.loadApps()
        this.dialogFormVisible = false
      })
    },
    async deleteApp(row) {
      await this.$confirm('应用被删除后，暂不可恢复，确定释放？', '确认释放应用？')
      if (row.status === 'running') { return showError('请先停止该应用服务') }
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
      this.$set(this.serviceLoading, app.appid, true)
      const res = await startApplicationInstance(app.appid)
        .finally(() => { this.$set(this.serviceLoading, app.appid, false) })
      if (res.data) {
        this.loadApps()
        return
      }
    },
    async stopApp(app) {
      await this.$confirm('确认要停止实例服务？', '实例操作确认')
      this.$set(this.serviceLoading, app.appid, true)
      const res = await stopApplicationInstance(app.appid)
        .finally(() => { this.$set(this.serviceLoading, app.appid, false) })
      if (res.data) {
        this.loadApps()
        return
      }
    },
    async restartApp(app) {
      if (app.status !== 'running') { return }
      await this.$confirm('确认要重启应用实例？', '实例操作确认')
      this.$set(this.serviceLoading, app.appid, true)
      const res = await restartApplicationInstance(app.appid)
        .finally(() => { this.$set(this.serviceLoading, app.appid, false) })
      if (res.data) {
        this.loadApps()
        return
      }
    },
    async exportApp(app) {
      this.loading = true
      const data = await exportApplication(app.appid)
        .finally(() => { this.loading = false })

      const time = parseTime(Date.now(), '{y}{m}{d}{h}{i}{s}')
      const filename = `${app.name}_${time}.lapp`
      exportRawBlob(filename, data)
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
      if (!this.importForm.file) return
      if (!this.importForm.app) return

      const app = this.importForm.app
      try {
        const file = this.importForm.file
        const appid = app?.appid
        const res = await importApplication(appid, file)
        if (res.error) {
          return showError('导入失败:' + res.error)
        }

        // 重启应用
        await restartApplicationInstance(app.appid)

        showSuccess('导入应用成功!')
        this.importForm = { app: null, file: null }
        this.dialogImportVisible = false
      } finally {
        this.loading = false
      }
    },
    getRuntimeVersion(app) {
      const image = app.runtime?.image
      if (!image) return 'unknown'
      const [, version] = image.split(':')
      return version || 'unknown'
    },
    formatSpec(spec) {
      if (!spec) return { label: '-', text: 'unknown' }
      const label = spec.label
      const memory = this.byte2mb(spec.limit_memory)
      const oss = this.byte2gb(spec.storage_capacity)
      const db = this.byte2gb(spec.database_capacity)
      const text = `内存:${memory}MB, 数据库:${db}GB, 存储:${oss}GB`
      return { memory, label, oss, db, text }
    },
    byte2mb(bytes) {
      return ~~(bytes / 1024 / 1024)
    },
    byte2gb(bytes) {
      return ~~(bytes / 1024 / 1024 / 1024)
    }
  }
}
</script>

<style scoped>
.application-container {
  width: calc(100vw - 30px);
  margin: 15px auto;
}

.table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-column-text {
  overflow:hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-left: 15px;
}

.copy-btn {
    display: block;
    font-size: 15px;
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
