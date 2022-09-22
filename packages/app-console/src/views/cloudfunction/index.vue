<template>
  <div class="app-container">
    <!-- 数据检索区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.keyword"
        placeholder="搜索"
        size="mini"
        style="width: 200px;margin-right: 10px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        size="mini"
        class="filter-item"
        type="default"
        icon="el-icon-search"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button
        plain
        size="mini"
        class="filter-item"
        type="primary"
        icon="el-icon-plus"
        @click="showCreateForm"
      >
        新建函数
      </el-button>
      <el-tooltip
        content="发布函数：函数要发布后才能生效"
        placement="bottom"
        effect="light"
      >
        <el-button
          plain
          class="filter-item"
          size="mini"
          type="success"
          icon="el-icon-guide"
          @click="publish"
        >
          发布函数
        </el-button>
      </el-tooltip>
      <el-checkbox
        v-model="listQuery.onlyEnabled"
        class="filter-item"
        label=""
        :indeterminate="false"
        @change="handleFilter"
      >只看已启用</el-checkbox>
    </div>

    <!-- 标签类别 -->

    <div class="tag-selector">
      <div class="label">标签类别</div>
      <el-radio-group v-model="listQuery.tag" size="mini" @change="getList">
        <el-radio-button :label="''" border>全部</el-radio-button>
        <el-radio-button
          v-for="tag in all_tags"
          :key="tag"
          :label="tag"
          border
        >{{ tag }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      size="small"
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="函数标识" min-width="200">
        <template slot-scope="{ row }">
          <span
            class="link-type"
            style="font-size: 13px; font-weight: bold;"
            @click="showUpdateForm(row)"
          >{{ row.label }}</span>
          <div
            style="display: flex;align-items: center;justify-content: flex-start;"
          >
            <div class="func-name">{{ row.name }}</div>
            <i
              v-clipboard:message="row.name"
              v-clipboard:success="onCopy"
              style="margin-left: 3px;"
              class="el-icon-document-copy copy-btn"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="标签" min-width="80">
        <template slot-scope="{ row }">
          <el-tag
            v-for="tag in row.tags"
            :key="tag"
            style="margin-right: 6px;"
            type="primary"
            size="mini"
          >{{ tag }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建/更新" width="120px" align="center">
        <template slot-scope="{ row }">
          <span v-if="row.created_at">{{
            row.created_at | parseTime('{y}-{m}-{d} {h}:{i}')
          }}</span>
          <span v-else>-</span>
          <br>
          <span v-if="row.updated_at">{{
            row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}')
          }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="HTTP" class-name="status-col" min-width="60">
        <template slot-scope="{ row }">
          <el-tag
            v-if="row.enableHTTP"
            type="success"
            size="mini"
            style="font-weight: bold"
          >
            可
          </el-tag>
          <el-tag v-else type="info" size="mini" style="font-weight: bold">
            不
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" min-width="60">
        <template slot-scope="{ row }">
          <el-tag
            v-if="row.status === 1"
            type="success"
            size="mini"
            style="font-weight: bold"
          >
            启
          </el-tag>
          <el-tag
            v-if="row.status === 0"
            type="warning"
            size="mini"
            style="font-weight: bold"
          >
            停
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="调用地址" align="center" min-width="70">
        <template slot-scope="{ row }">
          <el-tooltip
            :content="getFunctionInvokeBaseUrl(row.name)"
            placement="top"
          >
            <i
              v-clipboard:message="getFunctionInvokeBaseUrl(row.name)"
              v-clipboard:success="onCopy"
              class="el-icon-document-copy copy-btn"
            />
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        min-width="240"
        class-name="small-padding"
      >
        <template slot-scope="{ row, $index }">
          <el-button
            plain
            type="success"
            size="mini"
            @click="handleShowDetail(row)"
          >
            开发
          </el-button>
          <el-button plain type="info" size="mini" @click="handleShowLogs(row)">
            日志
          </el-button>
          <el-button
            plain
            type="primary"
            size="mini"
            @click="handleTriggers(row)"
          >
            触发器<b
              v-if="row.triggers && row.triggers.length"
            >({{ row.triggers.length }})</b>
          </el-button>
          <el-tooltip
            content="请先停用函数，再删除！"
            :disabled="row.status !== 1"
            placement="top"
          >
            <el-button
              v-if="row.status != 'deleted'"
              icon="el-icon-delete"
              plain
              size="mini"
              type="danger"
              circle
              @click="handleDelete(row, $index)"
            />
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 表单对话框 -->
    <el-dialog :title="textMap[dialogStatus]" width="600px" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="form"
        label-position="left"
        label-width="120px"
        style="width: 500px; margin-left:20px;"
      >
        <el-form-item v-if="form._id" label="ID" prop="_id">
          <div :value="form._id">{{ form._id }}</div>
        </el-form-item>
        <el-form-item label="显示名称" prop="label">
          <el-input v-model="form.label" placeholder="函数显示名，可为中文" />
        </el-form-item>
        <el-form-item label="函数标识" prop="name">
          <el-input
            v-model="form.name"
            placeholder="函数的唯一标识，如 get-user"
          />
        </el-form-item>
        <el-form-item label="HTTP访问" prop="enableHTTP">
          <el-switch
            v-model="form.enableHTTP"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
        <el-form-item label="标签分类" prop="tags">
          <el-tag
            v-for="(tag, index) in form.tags"
            :key="tag"
            style="margin-right: 10px;"
            type=""
            size="medium"
            closable
            @close="removeTag(index)"
          >{{ tag }}</el-tag>
          <el-autocomplete
            v-model="form._tag_input"
            :fetch-suggestions="suggestTags"
            class="input-new-tag"
            clearable
            size="mini"
            type="text"
            placeholder="添加"
            @select="addTag"
            @change="addTag"
          />
        </el-form-item>
        <el-form-item label="启用" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="函数描述">
          <el-input
            v-model="form.description"
            :autosize="{ minRows: 3, maxRows: 6 }"
            type="textarea"
            placeholder="函数描述"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? handleCreate() : handleUpdate()"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import {
  createFunction,
  getAllFunctionTags,
  getFunctions,
  publishFunctions,
  removeFunction,
  updateFunction
} from '@/api/func'
import { getAppAccessUrl } from '@/api/application'

const defaultCode = `

import cloud from '@/cloud-sdk'

exports.main = async function (ctx: FunctionContext) {
  // body, query 为请求参数, auth 是授权对象
  const { auth, body, query } = ctx

  // 数据库操作
  const db = cloud.database()
  const r = await db.collection('admins').get()
  console.log(r)

  return r.data
}
`

// 默认化创建表单的值
function getDefaultFormValue() {
  return {
    _id: undefined,
    name: '',
    label: '',
    description: '',
    status: 1,
    tags: [],
    enableHTTP: true,
    version: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    code: defaultCode,
    // 标签输入框绑定使用，不要提交到服务端
    _tag_input: ''
  }
}

const formRules = {
  name: [{ required: true, message: '标识不可为空，且只能含字母、数字、下划线、点及中划线', trigger: 'blur', pattern: /^[a-zA-Z0-9_\-\.]+$/ }],
  label: [{ required: true, message: '显示名称不可为空', trigger: 'blur' }]
}

export default {
  name: 'FunctionListPage',
  components: {
    Pagination
  },
  directives: {},
  filters: {
    statusFilter(status) {
      status = status ?? 0
      const statusMap = {
        0: 'disabled',
        1: 'enabled'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 10,
        keyword: undefined,
        tag: '',
        onlyEnabled: true // 只看启用的函数
      },
      form: getDefaultFormValue(),
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: formRules,
      all_tags: []
    }
  },
  computed: {},
  async mounted() {
    this.getList()
  },
  methods: {
    /** 获取所有标签 */
    async getAllTags() {
      const res = await getAllFunctionTags()
      this.all_tags = res.data
    },
    /**
     * 获取数据列表
     */
    async getList() {
      this.listLoading = true

      const { limit, page, keyword, tag, onlyEnabled } = this.listQuery
      const query = {}
      if (keyword) {
        query['keyword'] = keyword
      }
      if (tag !== '') {
        query['tag'] = tag
      }
      if (onlyEnabled) {
        query['status'] = 1
      }

      const ret = await getFunctions(query, page, limit)
      this.total = ret.total
      this.list = ret.data
      this.listLoading = false
      this.getAllTags()
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
      this.$refs['dataForm'].validate(async valid => {
        if (!valid) {
          return
        }
        const data = Object.assign({}, this.form)
        delete data['_tag_input']
        // 执行创建请求
        const res = await createFunction(data)
        if (!res.data?.insertedId) {
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
        this.getList()
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
      this.$refs['dataForm'].validate(async valid => {
        if (!valid) {
          return
        }

        // 执行创建请求
        const r = await updateFunction(this.form._id, {
          name: this.form.name,
          label: this.form.label,
          tags: this.form.tags || [],
          description: this.form.description,
          enableHTTP: this.form.enableHTTP ?? true,
          status: this.form.status ?? 1,
          updated_at: Date.now()
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

        this.getList()
        this.dialogFormVisible = false
      })
    },
    // 删除请求
    async handleDelete(row, index) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      if (row.status) {
        return this.$message.error('请先停用函数，再删除！')
      }

      // 执行删除请求
      const r = await removeFunction(row._id)

      if (r.error) {
        this.$notify({
          type: 'error',
          title: '操作失败',
          message: '删除失败！' + r.error
        })
        return
      }

      this.$notify({
        type: 'success',
        title: '操作成功',
        message: '删除成功！'
      })

      this.list.splice(index, 1)
    },
    // 发布云函数
    async publish() {
      const confirm = await this.$confirm('确定发布所有云函数？').catch(
        () => false
      )

      if (!confirm) return
      const res = await publishFunctions()
      if (res.error) {
        this.$message('发布失败: ' + res.error)
        return
      }
      this.$notify({
        type: 'success',
        title: '发布成功',
        message: '云函数发布成功！'
      })
    },
    // 查看详情
    async handleShowDetail(row) {
      this.$router.push(`functions/${row._id}`)
    },
    // 查看日志详情
    async handleShowLogs(row) {
      this.$router.push(`logs/${row._id}`)
    },
    // 设置触发器
    async handleTriggers(row) {
      this.$router.push(`triggers/${row._id}`)
    },
    // 搜索建议标签
    async suggestTags(queryString, cb) {
      const data = this.all_tags
        .filter(it => {
          return it.indexOf(queryString) >= 0
        })
        .map(it => {
          return { value: it }
        })

      cb(data)
    },
    // 删除标签
    removeTag(index) {
      const tags = this.form.tags || []
      if (!tags.length) return
      tags.splice(index, 1)
    },
    // 添加标签
    addTag() {
      const val = this.form._tag_input
      console.log('val: ', val)

      if (!val) return
      if (!this.form.tags.includes(val)) {
        this.form.tags.push(val)
      }
      this.form._tag_input = ''
    },
    onCopy() {
      this.$message.success('已复制')
    },
    getFunctionInvokeBaseUrl(func_name) {
      const app_url = getAppAccessUrl()
      return app_url + `/${func_name}`
    }
  }
}
</script>

<style lang="scss" scoped>
.filter-container {
  padding: 0;

  .filter-item {
    margin-left: 10px;
  }
}
.tag-selector {
  margin: 10px 0 10px;
  display: flex;

  .label {
    font-size: 14px;
    color: gray;
    align-self: center;
    padding-right: 20px;
  }
}

.table-column-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.func-name {
  color: darkcyan;
  // font-weight: bold;
  font-size: 14px;
}

.copy-btn {
  cursor: pointer;
}

.input-new-tag {
  width: 120px;
  margin-left: 10px;
  vertical-align: bottom;
}
.pagination-container {
  padding: 0;
  margin-top: 10px;
}
</style>
