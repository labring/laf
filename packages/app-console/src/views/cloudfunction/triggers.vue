<template>
  <div class="app-container">
    <div v-if="func" class="func-title">
      <h3>触发函数: {{ func.label }} <el-tag type="success">{{ func.name }}</el-tag></h3>
    </div>
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-button class="filter-item" plain type="default" size="mini" icon="el-icon-refresh" @click="getFunction">
        刷新
      </el-button>
      <el-button class="filter-item" plain type="primary" size="mini" icon="el-icon-plus" @click="showCreateForm">
        新建触发器
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column
        label="ID"
        prop="_id"
        align="center"
        width="220"
      >
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" min-width="120">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === 'event'" type="primary">事件</el-tag>
          <el-tag v-if="row.type === 'timer'" type="success">定时器</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="间隔/事件" align="center" width="100">
        <template slot-scope="{row}">
          <span v-if="row.type === 'event'">{{ row.event }}</span>
          <span v-if="row.type === 'timer'">{{ row.duration }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建/更新" width="140" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span><br>
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 0" type="danger">停用</el-tag>
          <el-tag v-if="row.status === 1" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="240" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="info" size="mini" @click="showTriggerLogs(row)">日志</el-button>
          <el-button type="primary" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
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
        label-width="100px"
        style="width: 400px; margin-left:0px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="触发器名称" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="form.type" placeholder="触发器类型" :disabled="!!form._id">
            <el-option label="事件" value="event" />
            <el-option label="定时器" value="timer" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'event'" label="事件" prop="event">
          <el-input v-model="form.event" placeholder="触发器事件" />
        </el-form-item>
        <el-form-item v-if="form.type === 'timer'" label="间隔" prop="duration">
          <el-input v-model.number="form.duration" min="1" type="number" placeholder="触发器间隔(秒）" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述" prop="desc">
          <el-input
            v-model="form.desc"
            :autosize="{ minRows: 3, maxRows: 6}"
            type="textarea"
            placeholder="触发器描述"
          />
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
import { getFunctionById } from '@/api/func'
import { createTrigger, removeTrigger, updateTrigger } from '@/api/trigger'

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: null,
    name: '',
    type: 'event',
    event: '',
    duration: 60,
    desc: '',
    status: 1,
    created_at: Date.now(),
    updated_at: Date.now()
  }
}

const formRules = {
  name: [{ required: true, message: '触发器名不可为空', trigger: 'blur' }],
  type: [{ required: true, message: '请选择触发器类型', trigger: 'blur' }],
  event: [{ required: true, message: '请填写触发器事件', trigger: 'blur' }],
  duration: [{ required: true, message: '请填写定时器间隔', trigger: 'blur' }, { type: 'number', message: '间隔必须为数字' }]
}

export default {
  name: 'TriggerListPage',
  directives: { },
  filters: {
    statusFilter(status) {
      status = status ?? 0
      const statusMap = {
        0: '停用',
        1: '启用'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      loading: false,
      value: '',
      func: null,
      funcId: '',
      list: null,
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
    this.funcId = this.$route.params.funcId
    await this.getFunction()
    this.setTagViewTitle()
  },
  methods: {
    /**
     * 获取函数数据
     */
    async getFunction() {
      const func_id = this.funcId
      this.loading = true
      const r = await getFunctionById(func_id)

      if (r.error) {
        this.$notify({
          type: 'error',
          title: '错误',
          message: '加载函数失败：' + r.error
        })
        return
      }

      this.func = r.data
      this.list = r.data?.triggers || []
      this.loading = false
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

        const params = { ...this.form }
        console.log(params)

        if (params.type === 'event') {
          params.duration = undefined
        }

        if (params.type === 'timer') {
          params.event = undefined
        }

        // 执行创建请求
        const r = await createTrigger(this.funcId, params)

        if (r.error) {
          this.$notify({
            type: 'error',
            message: '创建失败！' + r.error
          })
          return
        }

        this.$notify({
          type: 'success',
          message: '创建成功！'
        })

        this.getFunction()
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
    // 更新请求
    handleUpdate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        const r = await updateTrigger(this.funcId, this.form._id, {
          name: this.form.name,
          event: this.form.type === 'event' ? this.form.event : undefined,
          duration: this.form.type === 'timer' ? this.form.duration : undefined,
          desc: this.form.desc,
          status: this.form.status
        })

        if (r.error) {
          this.$notify({
            type: 'error',
            title: '操作失败',
            message: '更新失败！' + r.error
          })
          return
        }

        this.$notify({
          type: 'success',
          title: '操作成功',
          message: '更新成功！'
        })

        this.getFunction()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      if (row.status === 1) {
        this.$notify({
          type: 'error',
          title: '不可删除',
          message: '请先将触发器停用后再删除'
        })
        return
      }
      await this.$confirm('确认要删除此数据？', '删除确认')

      // 执行删除请求
      const r = await removeTrigger(this.funcId, row._id)

      if (r.error) {
        this.$notify({
          type: 'error',
          message: '删除失败！' + r.error
        })
        return
      }

      this.$notify({
        type: 'success',
        message: '删除成功！'
      })

      this.list.splice(index, 1)
    },
    // 查看触发器日志（跳转日志页）
    showTriggerLogs(row) {
      this.$router.push({ path: `../logs?trigger_id=${row._id}` })
    },
    // 设置标签标题
    setTagViewTitle() {
      const label = this.func.label
      const title = this.$route.meta.title
      const route = Object.assign({}, this.$route, { title: `${title}: ${label}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
    }
  }
}
</script>
<style lang="scss">
.func-title {
  margin-bottom: 20px;
}

</style>
