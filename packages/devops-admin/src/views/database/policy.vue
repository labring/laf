<template>
  <div class="components-container">
    <div class="create-btn" style="margin-bottom: 10px">
      <el-button v-permission="'rule.create'" type="primary" :disabled="loading" @click="dialogVisible = true">新建</el-button>
      <el-button v-permission="'rule.read'" icon="el-icon-refresh" type="info" style="margin-left: 10px" :disabled="loading" @click="getPolicies">刷新</el-button>
    </div>

    <el-select v-model="policy_id" size="mini" placeholder="选择策略" :loading="loading">
      <el-option
        v-for="item in policies"
        :key="item._id"
        :label="item.name"
        :value="item._id"
      />
    </el-select>
    <el-button v-permission="'rule.edit'" size="mini" type="success" style="margin-left: 15px" :disabled="loading" @click="updateRule">保存</el-button>
    <el-button v-permission="'rule.delete'" type="info" size="mini" style="margin-left: 20px" :disabled="loading" @click="removeRule">删除</el-button>

    <div class="main-row">
      <div class="collection-list">
        <div class="label">选择集合</div>
        <el-radio-group v-model="collection_name">
          <el-radio v-for="item in collections" :key="item" class="collection-radio" border size="medium" :label="item">
            {{ item }}
          </el-radio>
          <!-- <div/> -->
        </el-radio-group>
      </div>
      <div class="editor-container">
        <json-editor v-model="value" :dark="true" :height="600" />
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
          <el-select v-model="form.policy" placeholder="选择类别" :loading="loading">
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

const defaultValue = '{}'
const defaultForm = {
  collection: '',
  policy: ''
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
      const r = await db.collection('__policies')
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
      console.log(key, rule_data)
      const r = await db.collection('__policies')
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
      if (!this.form.category || !this.form.collection) {
        this.$message('请正确填写表单！')
        return
      }
      if (this.loading) {
        return
      }
      this.loading = true

      const { total } = await db.collection('__policies')
        .where({
          category: this.form.category,
          collection: this.form.collection
        }).count()

      if (total) {
        this.loading = false
        this.$message('该集合规则已存在！')
        return
      }
      const r = await db.collection('__policies')
        .add({
          category: this.form.category,
          collection: this.form.collection,
          data: defaultValue
        })

      if (!r.ok) {
        this.$message('创建失败!')
        this.loading = false
        return
      }

      await this.getCategories()

      this.category = this.form.category
      this.collection = this.form.collection

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
      if (!this.category || !this.collection) {
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

      const r = await db.collection('__policies')
        .where({
          category: this.category,
          collection: this.collection
        })
        .remove()

      if (r.ok && r.deleted) {
        this.$notify({
          title: '操作成功',
          type: 'success',
          message: '删除访问规则成功！'
        })
        this.getCategories()
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
  display: flex;
  .collection-list {
    width: 200px;
    margin-top: 20px;
    border-radius: 5px;

    .label {
      font-size: 14px;
      color: gray;
      margin-bottom: 10px;
    }
    .collection-radio {
      width: 100%;
      margin-bottom: 10px;
      margin-left: 0px;
    }
  }
  .editor-container{
    margin-left: 10px;
    position: relative;
    height: 100%;
    margin-top: 10px;
    width: 1000px;
  }
}

</style>

