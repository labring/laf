<template>
  <div class="components-container">
    <div class="create-btn" style="margin-bottom: 10px">
      <el-button v-permission="'rule.create'" type="primary" :disabled="loading" @click="dialogVisible = true">新建</el-button>
      <el-button v-permission="'rule.read'" icon="el-icon-refresh" type="info" style="margin-left: 5px" :disabled="loading" @click="getRule">刷新</el-button>
    </div>

    <el-select v-model="category" placeholder="选择类别" :loading="loading">
      <el-option
        v-for="item in categories"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
    <el-select v-model="collection" placeholder="选择集合" style="margin-left: 5px" :loading="loading">
      <el-option
        v-for="item in collections"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
    <el-button v-permission="'rule.edit'" type="success" style="margin-left: 5px" :disabled="loading" @click="updateRule">保存</el-button>
    <el-button v-permission="'rule.delete'" type="info" size="mini" style="margin-left: 20px" :disabled="loading" @click="removeRule">删除</el-button>

    <div class="editor-container">
      <json-editor v-model="value" :dark="true" :height="600" />
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
        <el-form-item label="规则类别">
          <el-select v-model="form.category" placeholder="选择类别" :loading="loading">
            <el-option
              v-for="item in categories"
              :key="item"
              :label="item"
              :value="item"
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
import { db } from '@/api/cloud'
import $ from 'lodash'
import { publishPolicy } from '../../api/publish'
import { array2map } from '@/utils/array'

const defaultValue = '{}'
const defaultForm = {
  collection: '',
  category: ''
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
      categoried: {}, // 以类别分组的规则
      category: null, // 当前选择的规则类别
      categories: [],
      collection: null, // 当前选择的表
      dialogVisible: false
    }
  },
  computed: {
    // 当前分类下的表
    collections() {
      return this.categoried[this.category]?.map(it => it.collection)
    }
  },
  watch: {
    category() {
      this.collection = $.head(this.collections)
    },
    collection() {
      this.value = defaultValue
      this.getRule()
    }
  },
  created() {
    this.getCategories()
  },
  methods: {
    async getCategories() {
      this.loading = true
      const r = await db.collection('__rules')
        .field(['category', 'collection'])
        .get()

      if (!r.ok) {
        console.error(r.error)
        return
      }

      const categoried = array2map(r.data, 'category', false)
      this.categoried = categoried
      this.categories = Object.keys(categoried)
      this.category = $.head(this.categories)

      this.value = defaultValue
      this.loading = false
    },
    async getRule() {
      this.loading = true
      const r = await db.collection('__rules')
        .where({
          category: this.category,
          collection: this.collection
        })
        .getOne()

      if (!r.ok) return
      this.value = JSON.parse(r.data.data)
      this.loading = false
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
      const r = await db.collection('__rules')
        .where({
          category: this.category,
          collection: this.collection
        })
        .update({
          data: rule_data
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

      const { total } = await db.collection('__rules')
        .where({
          category: this.form.category,
          collection: this.form.collection
        }).count()

      if (total) {
        this.loading = false
        this.$message('该集合规则已存在！')
        return
      }
      const r = await db.collection('__rules')
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

      const r = await db.collection('__rules')
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

<style scoped>
.editor-container{
  position: relative;
  height: 100%;
  margin-top: 10px;
  width: 1000px;
}
</style>

