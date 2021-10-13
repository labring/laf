<template>
  <div class="components-container">
    <span v-if="policy" style="color: black;">访问策略：<b>{{ policy.name }}</b></span>

    <!-- <div class="create-btn" style="margin-bottom: 10px" /> -->

    <el-button size="mini" icon="el-icon-refresh" type="default" style="margin-left: 15px" :disabled="loading" @click="getPolicy">刷新</el-button>
    <el-button plain size="mini" style="margin-left: 15px" type="primary" :disabled="loading" @click="dialogVisible = true">新建集合规则</el-button>

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
          <el-button plain class="btn" size="mini" type="success" :disabled="loading" @click="updateRule">保存(S)</el-button>
          <el-button plain class="btn" type="danger" size="mini" :disabled="loading" @click="removeRule">删除</el-button>
        </div>
        <json-editor v-model="value" class="editor" :line-numbers="true" :dark="false" :height="600" />
      </div>
    </div>

    <!-- 表单 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="创建集合"
    >
      <el-form :model="form" label-width="80px" label-position="left">
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
import $ from 'lodash'
import { getPolicyById, updatePolicyRules } from '@/api/policy'

const defaultValue =
{
  'read': true,
  'count': true,
  'update': false,
  'remove': false,
  'add': false
}

const defaultForm = {
  collection: ''
}
export default {
  name: 'RuleEditorPage',
  components: { JsonEditor },
  data() {
    return {
      form: { ...defaultForm },
      loading: false,
      value: defaultValue, // 编辑器的值
      rules: [], // 所有规则
      policy_id: null, // 当前选择的 policy id
      policy: null, // 当前策略对象
      collection_name: null, // 当前选择的 collection name
      dialogVisible: false
    }
  },
  computed: {
    // 当前策略下的集合
    collections() {
      if (!this.policy?.rules) return []
      return Object.keys(this.policy?.rules)
    }
  },
  watch: {
    collection_name() {
      this.value = defaultValue
      this.getRule()
    }
  },
  async created() {
    this.policy_id = this.$route.params.id
    await this.getPolicy()
    this.setTagViewTitle()
  },
  mounted() {
    document.removeEventListener('keydown', this.bindShortKey, false)
    document.addEventListener('keydown', this.bindShortKey, false)
  },
  activated() {
    document.removeEventListener('keydown', this.bindShortKey, false)
    document.addEventListener('keydown', this.bindShortKey, false)
  },
  deactivated() {
    document.removeEventListener('keydown', this.bindShortKey, false)
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.bindShortKey, false)
  },
  methods: {
    async getPolicy() {
      this.loading = true
      const r = await getPolicyById(this.policy_id)

      if (r.error) {
        console.error(r.error)
        return
      }

      this.policy = r.data
      if (!this.collection_name) {
        this.collection_name = $.head(this.collections)
      }
      this.getRule()
      this.loading = false
    },
    async getRule() {
      const rules = this.policy?.rules
      if (!rules) return null
      this.value = rules[this.collection_name] || defaultValue
    },
    async updateRule() {
      if (this.loading) return
      if (this.validate()) return
      this.loading = true

      this.policy.rules[this.collection_name] = JSON.parse(this.value)
      const data = {
        ...this.policy.rules
      }
      const r = await updatePolicyRules(this.policy_id, data)
        .finally(() => { this.loading = false })
      if (r.error) {
        console.error(r.error)
        this.$message('保存失败!')
        return
      }

      this.$notify({
        type: 'success',
        title: '保存',
        message: '保存访问规则成功!'
      })
    },
    async create() {
      const coll_name = this.form.collection
      if (!coll_name) return this.$message('请正确填写表单！')
      if (this.loading) return
      this.loading = true

      if (this.collections.includes(coll_name)) {
        this.loading = false
        this.$message('该集合规则已存在！')
        return
      }

      const data = {
        ...this.policy.rules,
        [coll_name]: defaultValue
      }
      const r = await updatePolicyRules(this.policy_id, data)
        .finally(() => { this.loading = false })
      if (r.error) {
        this.$message('创建失败!')
        console.error(r.error)
        return
      }

      await this.getPolicy()
      this.collection_name = coll_name
      this.$notify({
        type: 'success',
        title: '操作结果',
        message: '创建集合成功!'
      })
      this.form = { ...defaultForm }
      this.dialogVisible = false
    },
    async removeRule() {
      if (!this.collection_name) return this.$message('请选择要删除的集合规则！')
      if (this.loading) return
      const confirm = await this.$confirm('确定删除该条规则，该操作不可恢复？').catch(() => false)
      if (!confirm) return
      this.loading = true

      const data = { ...this.policy.rules }
      delete data[this.collection_name]
      const r = await updatePolicyRules(this.policy_id, data)
        .finally(() => { this.loading = false })

      if (r.error) {
        console.error(r.error)
        return this.$message('删除访问规则操作失败 ' + r.error)
      }

      this.$notify({
        title: '操作成功',
        type: 'success',
        message: '删除访问规则成功！'
      })
      this.collection_name = ''
      this.getPolicy()
    },
    setTagViewTitle() {
      const label = this.policy.name
      const title = this.$route.meta.title
      const route = Object.assign({}, this.$route, { title: `${title}: ${label}` })
      this.$store.dispatch('tagsView/updateVisitedView', route)
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
    },
    // 快捷键绑定
    async bindShortKey(e) {
      // Ctrl + s 为保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        this.updateRule()
        e.preventDefault()
      }
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
      margin-left: 0px !important;
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
        margin-right: 10px;
      }
    }

    .editor {
      border: 1px solid lightgray
    }
  }
}

</style>

