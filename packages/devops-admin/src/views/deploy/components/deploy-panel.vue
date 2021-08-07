<template>
  <div class="deploy-comp">
    <el-drawer
      title="部署面板"
      :visible="visible"
      direction="rtl"
      size="30%"
      :destroy-on-close="true"
      :show-close="true"
      :wrapper-closable="true"
      @close="onClose"
    >
      <div class="panel">
        <el-form ref="dataForm" :model="form" :rules="formRules" label-width="140px" :inline="false" size="normal">
          <el-form-item label="目标环境" prop="target">
            <el-select v-model="form.target" placeholder="请选择环境" filterable>
              <el-option
                v-for="item in targets"
                :key="item._id"
                :label="item.label"
                :value="item"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="policies && policies.length" label="部署策略" size="normal">
            <el-tag v-for="po in policies" :key="po._id" type="warning" size="medium" effect="dark" style="margin-right: 10px">
              {{ po.name }}
            </el-tag>
          </el-form-item>
          <el-form-item v-if="functions && functions.length" label="部署函数" size="normal">
            <el-tag v-for="func in functions" :key="func._id" type="default" size="mini" style="margin-right: 10px;">
              {{ func.name }} - {{ func.label }}
            </el-tag>
          </el-form-item>
          <el-form-item label="部署说明" prop="comment">
            <el-input
              v-model="form.comment"
              :autosize="{ minRows: 3, maxRows: 6}"
              type="textarea"
              placeholder="请说明本次部署修改了哪些信息"
            />
          </el-form-item>

          <el-form-item>
            <el-button size="small">取消</el-button>
            <el-button type="danger" plain size="small" @click="deploy">推送</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

  </div>
</template>
<script>
import { db } from '@/api/cloud'
import { deploy2remote } from '@/api/deploy'

// 表单验证规则
const formRules = {
  target: [{ required: true, message: '目标环境不可为空', trigger: 'blur' }],
  comment: [{ required: true, message: '部署说明不可为空', trigger: 'blur' }]
}

export default {
  name: 'DeployPanel',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    policies: {
      type: Array,
      default: null
    },
    functions: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      form: this.defaultForm(),
      // 部署目标
      targets: [],
      formRules
    }
  },
  computed: {
    visible() {
      return this.value
    }
  },
  async mounted() {
    const r = await db.collection('deploy_targets').get()
    if (!r.ok) throw new Error('get targets failed')

    this.targets = r.data
  },
  methods: {
    deploy() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (!valid) { return }
        const data = {
          policies: this.policies,
          functions: this.functions,
          comment: this.form.comment
        }
        const target = this.form.target
        const r = await deploy2remote(target.url, target.token, data)
        if (r.code === 0) {
          this.$message.success('操作成功！')
        }
      })
    },
    defaultForm() {
      return {
        target: null,
        comment: ''
      }
    },
    onClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style scoped>
.deploy-comp {

}
</style>
