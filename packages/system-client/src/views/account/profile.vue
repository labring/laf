<template>
  <div class="application-container">
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
      this.loading = true
      const res = await startApplication(app.appid)
        .finally(() => { this.loading = false })
      if (res.data) {
        this.$notify.success('启动应用成功')
        this.loadApps()
        return
      }
    },
    async stopApp(app) {
      await this.$confirm('确认要停止应用服务？', '服务操作确认')
      this.loading = true
      const res = await stopApplication(app.appid)
        .finally(() => { this.loading = false })
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
