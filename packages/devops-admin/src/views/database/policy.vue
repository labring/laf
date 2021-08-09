<template>
  <div class="components-container">
    <div class="create-btn" style="margin-bottom: 10px" />

    <el-select v-model="policy_id" size="medium" placeholder="选择策略" :loading="loading">
      <el-option
        v-for="item in policies"
        :key="item._id"
        :label="item.name"
        :value="item._id"
      />
    </el-select>
    <!-- <el-button  size="medium" style="margin-left: 15px" type="default" :disabled="loading" @click="dialogVisible = true">新建策略</el-button> -->
    <el-button size="medium" icon="el-icon-refresh" type="default" style="margin-left: 15px" :disabled="loading" @click="getPolicies">刷新</el-button>
    <!-- <el-button  type="danger" size="mini" style="margin-left: 20px" :disabled="loading" @click="removeRule">删除</el-button> -->

    <div class="main-row">
      <div class="collection-list">
        <div class="label">选择集合</div>
        <el-radio-group v-model="collection_name" class="radio-group">
          <el-radio v-for="item in collections" :key="item" class="collection-radio" border size="medium" :label="item">
            {{ item }}
          </el-radio>
        </el-radio-group>
      </div>
      <div class="editor-container">
        <div class="buttons">
          <el-button class="btn" style="margin-left: 0px" size="mini" type="primary" :disabled="loading" @click="dialogVisible = true">新建集合规则</el-button>
          <el-button class="btn" size="mini" type="success" :disabled="loading" @click="updateRule">保存</el-button>
          <el-button class="btn" type="danger" size="mini" :disabled="loading" @click="removeRule">删除</el-button>
        </div>
        <json-editor v-model="value" class="editor" :line-numbers="true" :dark="false" :height="600" />
      </div>
    </div>

    <aside style="margin-top: 15px">
      <span>请谨慎使用「发布所有规则」，规则配置错误，会导致整个应用都无法访问！</span>
    </aside>
    <el-button v-permission="'publish.policy'" type="danger" @click="apply">发布所有策略</el-button>

    <!-- 表单 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="创建集合"
    >
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="策略名称">
          <el-select v-model="form.policy_id" placeholder="选择类别" :loading="loading">
            <el-option
              v-for="item in policies"
              :key="item._id"
              :label="item.name"
              :value="item._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="集合名称">
          <el-input v-model="form.collection" placeholder="唯一标识，为字母" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="info"
          @click="dialogVisible = false"
        >
          取消
        </el-button>
        <el-button type="primary" @click="create">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import JsonEditor from '@/components/JsonEditor/rule'
import { db } from '../../api/cloud'
import $ from 'lodash'
import { publishPolicy } from '../../api/publish'
import { Constants } from '../../api/constants'

const defaultValue = '{}'
const defaultForm = {
  collection: '',
  policy_id: ''
}
export default {
  name: 'RuleEditorPage',
  components: { JsonEditor },
  data() {
    return {
      form: { ...defaultForm },
      loading: false,
      value: defaultValue,
      rules: [], // 所有规则
      policies: [],
      policy_id: null, // 当前选择的 policy _id
      collection_name: null, // 当前选择的 collection name
      dialogVisible: false
    }
  },
  computed: {
    // 当前策略下的集合
    collections() {
      if (!this.policy_id) return []

      return Object.keys(this.policy?.rules)
    },
    // 当前选中的 policy
    policy() {
      const [found] = this.policies.filter(po => po._id === this.policy_id)
      return found
    }
  },
  watch: {
    policy() {
      this.collection_name = $.head(this.collections)
    },
    collection_name() {
      this.value = defaultValue
      this.getRule()
    }
  },
  created() {
    this.getPolicies()
  },
  methods: {
    async getPolicies() {
      this.loading = true
      const r = await db.collection(Constants.cn.policies)
        .get()

      if (!r.ok) {
        console.error(r.error)
        return
      }

      this.policies = r.data
      this.policy_id = $.head(this.policies)?._id

      this.loading = false
    },
    async getRule() {
      const rules = this.policy?.rules
      if (!rules) return null
      this.value = rules[this.collection_name] || defaultValue
    },
    async updateRule() {
      if (this.loading) {
        return
      }
      if (this.validate()) {
        return
      }

      this.loading = true
      const rule_data = this.value
      const key = `rules.${this.collection_name}`
      const r = await db.collection(Constants.cn.policies)
        .where({
          _id: this.policy_id
        })
        .update({
          [key]: JSON.parse(rule_data)
        })

      if (!r.ok) {
        this.$message('保存失败!')
        this.loading = false
        return
      }

      this.$notify({
        type: 'success',
        title: '保存',
        message: '保存访问规则成功!'
      })

      this.loading = false
    },
    async create() {
      if (!this.form.policy_id || !this.form.collection) {
        this.$message('请正确填写表单！')
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true

      const key = `rules.${this.form.collection}`
      const { total } = await db.collection(Constants.cn.policies)
        .where({
          _id: this.form.policy_id,
          [key]: db.command.exists(true)
        }).count()

      if (total) {
        this.loading = false
        this.$message('该集合规则已存在！')
        return
      }
      const r = await db.collection(Constants.cn.policies)
        .where({
          _id: this.form.policy_id,
          [key]: db.command.exists(false)
        })
        .update({
          [key]: db.command.set({})
        })

      if (!r.ok) {
        this.$message('创建失败!')
        this.loading = false
        return
      }

      await this.getPolicies()

      this.policy_id = this.form.policy_id
      this.collection_name = this.form.collection

      this.$notify({
        type: 'success',
        title: '操作结果',
        message: '创建集合成功!'
      })
      this.form = { ...defaultForm }
      this.dialogVisible = false
      this.loading = false
    },
    async removeRule() {
      if (!this.policy_id || !this.collection_name) {
        this.$message('请选择要删除的集合规则！')
        return
      }
      if (this.loading) {
        return
      }

      const confirm = await this.$confirm('确定删除该条规则，该操作不可恢复？')
        .catch(() => false)

      if (!confirm) return

      this.loading = true

      const key = `rules.${this.collection_name}`
      const r = await db.collection(Constants.cn.policies)
        .where({
          _id: this.policy_id,
          [key]: db.command.exists(true)
        })
        .update({
          [key]: db.command.remove()
        })

      if (r.ok && r.updated) {
        this.$notify({
          title: '操作成功',
          type: 'success',
          message: '删除访问规则成功！'
        })
        this.getPolicies()
      } else {
        this.$message('删除访问规则操作失败 ' + r.error)
      }

      this.loading = false
    },
    async apply() {
      const confirm = await this.$confirm('确定发布所有规则？')
        .catch(() => false)

      if (!confirm) return

      const res = await publishPolicy()
      if (res.data.code) {
        this.$message('发布失败: ' + res.data.error)
        return
      }
      this.$notify({
        type: 'success',
        title: '发布成功',
        message: '访问策略发布成功！'
      })
    },
    validate() {
      let error = null
      let value
      try {
        value = JSON.parse(this.value)
      } catch (_err) {
        error = '非法的 JSON 格式，请检查！'
      }

      if (value === '') {
        error = '规则值不可为空'
      }

      if (error) {
        this.$message(error)
        return error
      }
      return null
    }
  }
}
</script>

<style lang="scss" scoped>
.main-row {
  border-top: 1px solid lightgray;
  padding-top: 20px;
  margin-top: 20px;
  display: flex;

  .collection-list {
    width: 250px;

    padding-bottom: 10px;
    border-radius: 5px;
    box-sizing: border-box;

    .label {
      font-size: 14px;
      color: gray;
      margin-bottom: 10px;
    }

    .radio-group {
      width: 100%;
      height: 640px;
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .radio-group::-webkit-scrollbar {
        display: none;
    }

    .collection-radio {
      width: 80%;
      margin-bottom: 10px;
      margin-left: 0px;
    }
  }

  .editor-container{
    margin-left: 10px;
    position: relative;
    height: 100%;
    width: 1000px;

    .buttons {
      display: flex;
      width: 400px;
      justify-content: flex-start;
      margin-bottom: 10px;

      .btn {
        margin-left: 15px;
      }
    }

    .editor {
      border: 1px solid lightgray
    }
  }
}

</style>

