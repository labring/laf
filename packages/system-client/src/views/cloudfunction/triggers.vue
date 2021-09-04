<template>
  <div class="app-container">
    <div v-if="func" class="func-title">
      <h3>触发函数: {{ func.label }}</h3>
      函数调用名：<el-tag type="success">{{ func.name }}</el-tag>
    </div>
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索"
        style="width: 200px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-permission="'trigger.create'" class="filter-item" type="primary" icon="el-icon-search" @click="showCreateForm">
        新建触发器
      </el-button>
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
      <el-table-column
        label="ID"
        prop="id"
        sortable="custom"
        align="center"
        width="240"
      >
        <template slot-scope="{row}">
          <span>{{ row._id }}</span>
        </template>
      </el-table-column>
      <el-table-column label="名称" width="150">
        <template slot-scope="{row}">
          <span class="link-type" @click="showUpdateForm(row)">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === 'event'" type="primary">事件</el-tag>
          <el-tag v-if="row.type === 'timer'" type="success">定时器</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="间隔/事件" align="center">
        <template slot-scope="{row}">
          <span v-if="row.type === 'event'">{{ row.event }}</span>
          <span v-if="row.type === 'timer'">{{ row.duration }}</span>
        </template>
      </el-table-column>
      <el-table-column label="描述" align="center">
        <template slot-scope="{row}">
          <span v-if="row.desc">{{ row.desc }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="120">
        <template slot-scope="{row}">
          <el-tag v-if="row.status === 0" type="danger">停用</el-tag>
          <el-tag v-if="row.status === 1" type="success">启用</el-tag>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="340" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="info" size="mini" @click="showTriggerLogs(row)">日志</el-button>
          <el-button v-permission="'trigger.edit'" type="primary" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" v-permission="'trigger.delete'" size="mini" type="danger" @click="handleDelete(row,$index)">
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
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import { db } from '@/api/cloud'
import { publishTriggers } from '@/api/publish'
import { Constants } from '../../api/constants'

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
  components: { Pagination },
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
    this.getList()
  },
  methods: {
    /**
     * 获取函数数据
     */
    async getFunction() {
      const func_id = this.funcId
      this.loading = true
      const r = await db.collection(Constants.cn.functions)
        .where({ _id: func_id })
        .getOne()

      if (!r.ok || !r.data) {
        this.$notify({
          type: 'error',
          title: '错误',
          message: '加载函数失败：' + r.error
        })
        return
      }

      this.func = r.data
      this.loading = false
    },
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true

      // 拼装查询条件 by this.listQuery
      const { limit, page, keyword } = this.listQuery
      const query = {
        func_id: this.funcId
      }
      if (keyword) {
        query['$or'] = [
          { name: db.RegExp({ regexp: `.*${keyword}.*` }) },
          { desc: db.RegExp({ regexp: `.*${keyword}.*` }) }
        ]
      }

      // 执行数据查询
      const res = await db.collection(Constants.cn.triggers)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .get()
        .catch(() => { this.listLoading = false })

      this.list = res.data

      // 获取数据总数
      const { total } = await db.collection(Constants.cn.triggers)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .count()
        .catch(() => { this.listLoading = false })

      this.total = total
      this.listLoading = false
    },
    // 发布触发器配置
    async applyTrigger(triggerId) {
      await publishTriggers()
    },
    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
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

        const params = { ...this.form, func_id: this.funcId }
        console.log(params)

        if (params.type === 'event') {
          params.duration = undefined
        }

        if (params.type === 'timer') {
          params.event = undefined
        }

        // 执行创建请求
        const r = await db.collection(Constants.cn.triggers)
          .add(params)

        if (!r.id) {
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

        this.applyTrigger(r.id)
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
    // 更新请求
    handleUpdate() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }

        // 执行创建请求
        const r = await db.collection(Constants.cn.triggers)
          .where({ _id: this.form._id })
          .update({
            name: this.form.name,
            type: this.form.type,
            event: this.form.type === 'event' ? this.form.event : undefined,
            duration: this.form.type === 'timer' ? this.form.duration : undefined,
            desc: this.form.desc,
            status: this.form.status,
            updated_at: Date.now()
          })

        if (!r.ok) {
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

        this.applyTrigger(this.form._id)
        this.getList()
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
      const r = await db.collection(Constants.cn.triggers)
        .where({ _id: row._id, status: 0 })
        .remove()

      if (!r.ok) {
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
      this.$router.push(`/development/function-logs?trigger_id=${row._id}`)
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
