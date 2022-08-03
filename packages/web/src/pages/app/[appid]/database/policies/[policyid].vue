<script setup lang="ts">
import { head } from 'lodash'
import { getPolicyById, updatePolicyRules } from '~/api/policy'
import JsonEditor from '~/components/JsonEditor/param.vue'

const route = useRoute()

const defaultValue = {
  read: true,
  count: true,
  update: false,
  remove: false,
  add: false,
}

const defaultForm = {
  collection: '',
}

let loading = $ref(false)
let form = $ref({ ...defaultForm })
let value: any = $ref(JSON.stringify(defaultValue)) // 编辑器的值
let policy_id: any = $ref(null) // 当前选择的 policy id
let policy: any = $ref(null) // 当前策略对象
let collection_name: any = $ref(null) // 当前选择的 collection name
let dialogVisible = $ref(false)

// 当前策略下的集合
const collections = $computed(() => {
  if (!policy?.rules)
    return []
  return Object.keys(policy?.rules)
})

async function getPolicy() {
  loading = true
  const r = await getPolicyById(policy_id)

  if (r.error) {
    console.error(r.error)
    return
  }

  policy = r.data

  if (!collection_name)
    collection_name = head(collections)

  getRule()
  loading = false
}

async function getRule() {
  const rules = policy?.rules
  if (!rules)
    return null
  value = rules[collection_name] || defaultValue
}

async function updateRule() {
  if (loading)
    return
  if (validate())
    return
  loading = true

  policy.rules[collection_name] = JSON.parse(value)
  const data = {
    ...policy.rules,
  }
  const r = await updatePolicyRules(policy_id, data)
    .finally(() => { loading = false })
  if (r.error) {
    console.error(r.error)
    ElMessage.success('保存失败!')
    return
  }

  ElNotification({
    type: 'success',
    title: '保存',
    message: '保存访问规则成功!',
  })
}

async function create() {
  const coll_name = form.collection
  if (!coll_name)
    return ElMessage.success('请正确填写表单！')
  if (loading)
    return
  loading = true

  if (collections.includes(coll_name)) {
    loading = false
    ElMessage.success('该集合规则已存在！')
    return
  }

  const data = {
    ...policy.rules,
    [coll_name]: defaultValue,
  }
  const r = await updatePolicyRules(policy_id, data)
    .finally(() => { loading = false })
  if (r.error) {
    ElMessage.success('创建失败!')
    console.error(r.error)
    return
  }

  await getPolicy()
  collection_name = coll_name
  ElNotification({
    type: 'success',
    title: '操作结果',
    message: '创建集合成功!',
  })
  form = { ...defaultForm }
  dialogVisible = false
}

async function removeRule() {
  if (!collection_name)
    return ElMessage.success('请选择要删除的集合规则！')
  if (loading)
    return
  const confirm = await ElMessageBox.confirm('确定删除该条规则，该操作不可恢复？').catch(() => false)
  if (!confirm)
    return
  loading = true

  const data = { ...policy.rules }
  delete data[collection_name]
  const r = await updatePolicyRules(policy_id, data)
    .finally(() => { loading = false })

  if (r.error) {
    console.error(r.error)
    return ElMessage.success(`删除访问规则操作失败 ${r.error}`)
  }

  ElNotification({
    title: '操作成功',
    type: 'success',
    message: '删除访问规则成功！',
  })
  collection_name = ''
  getPolicy()
}

function setTagViewTitle() {
  const label = policy.name
  const title = route.meta.title
  const newRoute = Object.assign({}, route, { title: `${title}: ${label}` })
  // TODO
  // $store.dispatch('tagsView/updateVisitedView', route)
}

function validate() {
  let error = null
  let _value
  try {
    _value = JSON.parse(value)
  }
  catch (_err) {
    error = '非法的 JSON 格式，请检查！'
  }

  if (_value === '')
    error = '规则值不可为空'

  if (error) {
    ElMessage.success(error)
    return error
  }
  return null
}

async function bindShortKey(e: KeyboardEvent) {
  // Ctrl + s 为保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    updateRule()
    e.preventDefault()
  }
}

watch($$(collection_name), (val) => {
  if (val) {
    value = defaultValue
    getRule()
  }
})

onMounted(async () => {
  document.removeEventListener('keydown', bindShortKey, false)
  document.addEventListener('keydown', bindShortKey, false)

  policy_id = route.params.policyid
  await getPolicy()
  setTagViewTitle()
})

onActivated(() => {
  document.removeEventListener('keydown', bindShortKey, false)
  document.addEventListener('keydown', bindShortKey, false)
})

onDeactivated(() => {
  document.removeEventListener('keydown', bindShortKey, false)
})

onUnmounted(() => {
  document.removeEventListener('keydown', bindShortKey, false)
})
</script>

<template>
  <div class="components-container">
    <div class="mb-24px">
      <span v-if="policy" style="color: black;">访问策略：<b>{{ policy.name }}</b></span>

      <!-- <div class="create-btn" style="margin-bottom: 10px" /> -->

      <el-button icon="Refresh" type="default" style="margin-left: 15px" :disabled="loading" @click="getPolicy">
        刷新
      </el-button>
      <el-button style="margin-left: 15px" type="primary" :disabled="loading" @click="dialogVisible = true">
        新建集合规则
      </el-button>
    </div>

    <el-container style="height: calc(100vh - 140px);">
      <el-aside width="240px" class="mr-24px">
        <div class="label">
          选择集合
        </div>
        <el-radio-group v-model="collection_name" class="radio-group w-full">
          <el-radio
            v-for="item in collections" :key="item" class="mb-12px" border
            style="margin-right: 0; padding-right: 0; width: 100%;" :label="item"
          >
            {{ item }}
          </el-radio>
        </el-radio-group>
      </el-aside>
      <el-container class="record-list ">
        <div class="editor-container flex-1">
          <div class="buttons">
            <el-button class="btn" type="success" :disabled="loading" @click="updateRule">
              保存(S)
            </el-button>
            <el-button class="btn" type="danger" :disabled="loading" @click="removeRule">
              删除
            </el-button>
          </div>
          <JsonEditor v-model="value" />
        </div>
      </el-container>
    </el-container>

    <!-- 表单 -->
    <el-dialog v-model="dialogVisible" title="创建集合">
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="集合名称">
          <el-input v-model="form.collection" placeholder="唯一标识，为字母" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="info" @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="create">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 策略详情
hidden: true
meta:
  title: 策略管理
</route>
