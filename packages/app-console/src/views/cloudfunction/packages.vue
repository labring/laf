<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button plain size="mini" class="filter-item" type="default" icon="el-icon-refresh" @click="getList">
        刷新
      </el-button>
      <el-button plain size="mini" class="filter-item" type="primary" icon="el-icon-plus" @click="showCreateForm">
        添加
      </el-button>
      <el-button plain size="mini" class="filter-item" type="default" @click="restartApp">
        重启服务
      </el-button>
      <span style="margin-left: 20px; font-size: 14px;color: blue;">（依赖变更后，需要重启服务才能生效！）</span>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="max-width: 600px"
      size="medium"
    >
      <el-table-column label="名称" width="240">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="版本" width="140" align="center">
        <template slot-scope="{row}">
          <span>{{ row.version }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button plain size="mini" type="success" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" plain size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="140px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="依赖包名" prop="name">
          <el-input v-model="form.name" :disabled="dialogStatus!=='create'" placeholder="请输入依赖包名" style="width: 400px" />
        </el-form-item>
        <el-form-item label="依赖版本" prop="version">
          <el-input v-model="form.version" placeholder="latest" style="width: 400px" />
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
import store from '@/store'
import { addApplicationPackage, getApplicationPackages, removeApplicationPackage, restartApplicationInstance, updateApplicationPackage } from '@/api/application'
import { showError, showSuccess } from '@/utils/show'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    name: '',
    version: ''
  }
}

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '依赖包名不可为空', trigger: 'blur' }],
  version: [{ required: false, message: '', trigger: 'blur' }]
}

export default {
  name: 'PakcagesPage',
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      form: getDefaultFormValue(),
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '添加'
      },
      rules: formRules,
      downloadLoading: false
    }
  },
  computed: {
    app() {
      return store.state.app.application
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true
      const res = await getApplicationPackages(this.app.appid)
      this.list = res.data
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

        const name = this.form.name
        const version = this.form.version || 'latest'

        const r = await addApplicationPackage(this.app.appid, { name, version })
        if (r.error) {
          console.error(r.error)
          return showError('操作失败: ' + r.error)
        }

        showSuccess('操作成功')
        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 显示更新表单
    showUpdateForm(row) {
      this.form = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async restartApp() {
      await this.$confirm('确认要重启应用服务？', '服务操作确认')
      this.listLoading = true
      const app = this.app
      await restartApplicationInstance(app.appid)

      this.listLoading = false
      showSuccess('操作成功')
    },
    // 更新请求
    handleUpdate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        // 构建更新数据对象
        const data = {
          name: this.form.name,
          version: this.form.version
        }

        // 执行更新请求
        const r = await updateApplicationPackage(this.app.appid, data)
        if (r.error) {
          return showError('更新失败: ' + r.error)
        }

        showSuccess('更新成功！')
        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      const r = await removeApplicationPackage(this.app.appid, row.name)
      if (r.error) {
        return showError('删除失败: ' + r.error)
      }

      showSuccess('删除成功！')
      this.getList()
    }
  }
}
</script>
