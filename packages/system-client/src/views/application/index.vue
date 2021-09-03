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
    <el-table v-loading="loading" empty-text="-" :data="applications.created" style="width: 100%;margin-top:10px;" stripe>
      <el-table-column align="center" label="App ID" width="320">
        <template slot-scope="scope">
          <div class="table-row">
            <div> {{ scope.row.appid }}</div>
            <i v-clipboard:message="scope.row.appid" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用名" width="300">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="300">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="服务启停" align="center" width="200" class-name="small-padding">
        <template slot-scope="{row}">
          <el-button v-if="row.status !== 'running'" plain type="warning" size="mini" @click="startApp(row)">
            启动
          </el-button>
          <el-button v-if="row.status === 'running'" plain type="danger" size="mini" @click="stopApp(row)">
            停止
          </el-button>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="380" class-name="small-padding">
        <template slot-scope="{row,$index}">
          <el-button plain type="primary" size="mini" @click="toDetail(row)">
            开发
          </el-button>
          <el-button plain type="default" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button plain size="mini" type="info" @click="deleteApp(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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
  </div>
</template>

<script>
import { createApplication, getMyApplications, startApplication, stopApplication, updateApplication } from '@/api/application'
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
      rules: formRules
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
    async deleteApp() {
      this.$message('尚未实现此功能')
    },
    onCopy() {
      this.$message.success('已复制')
    },
    async startApp(app) {
      const res = await startApplication(app.appid)
      if (res.data) {
        this.$notify.success('启动应用成功')
        this.loadApps()
        return
      }
    },
    async stopApp(app) {
      await this.$confirm('确认要停止应用服务？', '服务操作确认')

      const res = await stopApplication(app.appid)
      if (res.data) {
        this.$notify.success('停止应用成功')
        this.loadApps()
        return
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
  box-shadow: -1px -1px 5px 0 rgb(0 0 0 / 10%);
  background: white;
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
</style>
