<script setup lang="ts">
import { EJSON } from 'bson'
import type { ReactiveVariable } from 'vue/macros'
import { createCollection, deleCollectionIndex, getCollectionIndexes, getCollections, getDb, setCollectionIndexes, updateCollection } from '~/api/collec'
import Copy from '~/components/Copy.vue'
import JsonEditor from '~/components/JsonEditor/param.vue'

const db = getDb()

let loading = $ref(false)
let collections: any = $ref([])
let collectionName = $ref('')
const listQuery: any = $ref({ limit: 10, page: 1, id: '' })
let list: any = $ref([])
let indexes = $ref([])
let total = $ref(0)
let record: any = $ref('{}')
let formMode = $ref('edit')
let showCreateIndexDialog = $ref(false)
const showDocEditorForm = ref(false)
const createIndexForm = $ref<{
  key?: string
  name?: string
  unique?: boolean
}>({})
const showIndexesList = $ref(false)
let showCreateCollectionForm = $ref(false)
const createCollectionForm = $ref({ collectionName: '' })
let showCollectionSchemaForm = $ref(false)
const collectionSchemaForm = $ref({ schema: '' })

async function fetchCollections() {
  loading = true
  let ret = await getCollections().finally(() => {
    loading = false
  })

  ret = ret.filter((it: { name: string }) => {
    if (it.name.endsWith('.chunks'))
      return false
    if (it.name.endsWith('.files'))
      return false
    return true
  })
  const sorted = (ret || []).sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name))
  collections = sorted
  collectionName = sorted[0]?.name || ''
  getList()
}

function handleFilter() {
  listQuery.page = 1
  getList()
}

async function getList() {
  if (!collectionName)
    return

  const { limit, page, _id } = listQuery

  const query = _id ? { _id } : {}

  // 执行数据查询
  const res = await db
    .collection(collectionName)
    .where(query)
    .limit(limit)
    .skip((page - 1) * limit)
    .get()

  list = res.data

  // 获取数据总数
  const ret = await db.collection(collectionName).where(query).count()

  total = ret.total
}

async function handleCreateCollection() {
  const collectionName = createCollectionForm.collectionName
  if (!collectionName)
    return ElMessage.error('集合名不可为空')

  await createCollection(collectionName)
    .then((res) => {
      ElMessage.success('集合创建成功！')
      fetchCollections()
    })
    .catch((err) => {
      console.error(err.response.data)
      if (err.response?.data?.code === 'NamespaceExists')
        ElMessage.error('错误：该集合已存在')

      else
        ElMessage.error(`创建集合失败: ${err.response?.data?.error}`)
    })
    .finally(() => {
      createCollectionForm.collectionName = ''
      showCreateCollectionForm = false
    })
}

async function handleShowCollectinoSchema() {
  const deulfaSchema = {
    bsonType: 'object',
    required: [],
    properties: {
      _id: {
        description: 'ID，系统自动生成',
      },
    },
  }
  // find the collection schema
  const [collection] = collections.filter(
    (coll: { name: ReactiveVariable<string> }) => coll.name === collectionName,
  )
  if (!collection)
    return

  const schema = collection.options?.validator?.$jsonSchema
  collectionSchemaForm.schema = schema || deulfaSchema
  showCollectionSchemaForm = true
}

async function updateCollectionSchema() {
  await ElMessageBox.confirm('确认要更新集合结构？', '确认')
  if (!collectionName)
    return

  const schema = collectionSchemaForm.schema
  const schemaData
    = typeof schema === 'string' ? JSON.parse(schema) : schema

  loading = true
  await updateCollection(collectionName, schemaData)
    .then((res) => {
      ElMessage.success('集合更新成功')
      fetchCollections()
    })
    .catch((err) => {
      console.error(err.response.data)
      ElMessage.error(`更新集合失败: ${err.response?.data?.error}`)
    })
    .finally(() => {
      loading = false
    })
}

function getClass(val: { _id: any }) {
  const isString = typeof record === 'string'
  try {
    if (isString) {
      const _record = JSON.parse(record)
      return val._id === _record._id ? 'active' : ''
    }
  }
  catch (error) {

  }
}

async function deleRecord(record: { _id: any }) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')

  await db.collection(collectionName)
    .where({ _id: record._id })
    .remove()

  getList()
}

function handleEditRecord(val: any) {
  record = EJSON.serialize(val)
  formMode = 'edit'
  showDocEditorForm.value = true
}

async function updateDocument(upRecord: any) {
  await ElMessageBox.confirm('确认要更新数据？', '确认')
  // 将 [EJSON字符串] 解析为 [JSON对象]
  const parsed
    = typeof upRecord === 'string' ? JSON.parse(upRecord) : upRecord

  // 将 [JSON对象] 序列化为 [EJSON对象]
  const serialized: any = EJSON.deserialize(parsed)
  const { _id, ...params } = serialized

  if (!_id)
    return

  const r = await db
    .collection(collectionName)
    .where({ _id })
    .update({ ...params }, { merge: false })

  if (r.error) {
    const message
      = typeof r.error !== 'string' ? JSON.stringify(r.error) : r.error
    return ElMessage.error(`更新失败: ${message}`)
  }

  ElMessage.success('更新成功')
  getList()
}

function handleCreateRecord() {
  formMode = 'create'
  record = {}
  showDocEditorForm.value = true
}

async function addDocument(record: any) {
  try {
    const params = JSON.parse(record)
    const r = await db.collection(collectionName).add({ ...params })

    if (r.error) {
      const message
        = typeof r.error !== 'string' ? JSON.stringify(r.error) : r.error
      return ElMessage.error(`添加失败: ${message}`)
    }

    ElMessage.success('添加成功')
    getList()
    showDocEditorForm.value = false
  }
  catch (error) {
    ElMessage.error(`创建失败！${error}`)
  }
}

/**
 * 获取集合索引列表
 */
async function getIndexes() {
  if (!collectionName)
    return
  const ret = await getCollectionIndexes(collectionName)
  indexes = ret
}

/**
 * 删除索引
 */
async function deleIndex(row: any) {
  await ElMessageBox.confirm('确认要删除此数据？', '删除确认')
  await deleCollectionIndex(collectionName, row.name)

  ElMessage.success('删除成功')
  getIndexes()
}

/**
 * 创建索引
  */
async function createIndex() {
  const form = createIndexForm
  const keyName = form.key || ''
  const params = {
    spec: {
      [keyName]: 1,
    },
    unique: form.unique,
  }
  await setCollectionIndexes(collectionName, params)

  ElMessage.success('创建成功')
  showCreateIndexDialog = false
  getIndexes()
}

function handleCreateIndex() {
  showCreateIndexDialog = true
}

watch($$(collectionName), (val) => {
  if (val) {
    listQuery.page = 1
    getList()
    getIndexes()
  }
})

onMounted(() => {
  fetchCollections()
})
</script>

<template>
  <div class="app-container">
    <!-- 记录 -->
    <div class="mb-24px">
      <el-input
        v-model.trim="listQuery._id" placeholder="请输入_id查找" style="width: 200px" :disabled="!collectionName"
        @keyup.enter="handleFilter"
      />
      <el-button
        type="default" style="margin-left: 10px" icon="Search" :disabled="!collectionName"
        @click="handleFilter"
      >
        搜索
      </el-button>
      <el-button type="primary" style="margin-left: 10px" @click="showCreateCollectionForm = true">
        新建集合
      </el-button>
      <el-button type="default" style="margin-left: 10px" :disabled="!collectionName" @click="showIndexesList = true">
        索引管理
      </el-button>
      <el-button
        type="default" style="margin-left: 10px" :disabled="!collectionName"
        @click="handleShowCollectinoSchema"
      >
        集合结构
      </el-button>
      <el-button
        type="success" style="margin-left: 10px" icon="Plus" :disabled="!collectionName"
        @click="handleCreateRecord"
      >
        添加记录
      </el-button>
      <el-button>
        <span class="mr-6px">复制名称</span>
        <Copy :text="collectionName" />
      </el-button>
    </div>
    <el-container>
      <el-aside width="240px" class="px-12px">
        <div class="label mb-12px">
          <span class="text-sm">选择集合</span>
          <el-button
            :loading="loading" circle link style="margin-left: 10px" icon="Refresh"
            @click="fetchCollections"
          />
        </div>
        <el-radio-group v-model="collectionName" class="radio-group w-full">
          <el-radio
            v-for="item in collections" :key="item.name" class="mb-12px" border
            style="margin-right: 0; padding-right: 0; width: 100%;" :label="item.name"
          />
        </el-radio-group>
      </el-aside>

      <el-container class="flex-col" style="flex-direction: column">
        <div
          v-for="item in list" :key="item._id.toString()" class=" flex border-gray-300 rounded mb-24px p-12px"
          :class="getClass(item)"
        >
          <div class="doc flex-1">
            <pre class="">{{ item }}</pre>
          </div>
          <div class="tools">
            <el-button class="tools-btn" type="primary" @click="handleEditRecord(item)">
              编辑
            </el-button>
            <el-button class="tools-btn" type="danger" @click="deleRecord(item)">
              删除
            </el-button>
          </div>
        </div>
        <div style="text-align: right">
          <!-- 分页 -->
          <el-pagination
            v-show="total > 0" v-model:page-size="listQuery.limit" v-model:limit="listQuery.limit"
            background class="mt-12px" :total="total" layout="->, total, prev, pager, next" @size-change="getList"
            @current-change="getList"
          />
        </div>
      </el-container>
    </el-container>

    <!-- 索引管理 -->
    <el-drawer v-model="showIndexesList" title="索引管理" size="50%">
      <div>
        <div style="margin: 10px 0">
          <el-button
            type="primary" style="margin-left: 10px" icon="Plus" :disabled="!collectionName"
            @click="handleCreateIndex"
          >
            创建索引
          </el-button>
        </div>
        <el-table :data="indexes" style="width: 100%">
          <el-table-column prop="name" label="索引名称" align="center" />
          <el-table-column label="索引属性" align="center">
            <template #default="{ row }">
              {{ row.unique ? '唯一' : '非唯一' }}
            </template>
          </el-table-column>
          <el-table-column label="索引字段" align="center">
            <template #default="{ row }">
              {{ Object.keys(row.key)[0] }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button type="danger" @click="deleIndex(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 编辑集合数据结构 -->
    <el-drawer v-model="showCollectionSchemaForm" :title="`集合数据结构:${collectionName}`" size="50%">
      <el-button :loading="loading" type="primary" :disabled="!collectionName" @click="updateCollectionSchema">
        保存
      </el-button>
      <JsonEditor
        v-model="collectionSchemaForm.schema" class="db-editor" :line-numbers="true" :dark="false"
        :height="600"
      />
    </el-drawer>

    <!-- 添加/编辑文档表单 -->
    <el-drawer v-model="showDocEditorForm" :title="formMode === 'edit' ? '编辑文档' : '添加文档'" size="50%">
      <el-button
        class="mb-12px" type="primary" :disabled="!collectionName"
        @click="formMode === 'edit' ? updateDocument(record) : addDocument(record)"
      >
        保存
      </el-button>
      <JsonEditor v-model="record" />
    </el-drawer>

    <!-- 创建集合表单 -->
    <el-dialog v-model="showCreateCollectionForm" title="创建集合" width="500px">
      <el-form :model="createCollectionForm" label-width="80px" style="width: 460px">
        <el-form-item label="集合名称">
          <el-input v-model="createCollectionForm.collectionName" placeholder="请输入新集合名称" />
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button type="default" @click="showCreateCollectionForm = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleCreateCollection">
          确认
        </el-button>
      </div>
    </el-dialog>

    <!-- 创建索引表单 -->
    <el-dialog v-model="showCreateIndexDialog" title="创建索引">
      <el-form :model="createIndexForm" label-width="100px" style="width: 600px">
        <el-form-item label="索引名称">
          <el-input v-model="createIndexForm.name" placeholder="请输入索引名称" />
        </el-form-item>
        <el-form-item label="索引属性">
          <el-radio-group v-model="createIndexForm.unique">
            <el-radio :label="true">
              唯一
            </el-radio>
            <el-radio :label="false">
              非唯一
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="索引字段" style="width: 250px">
          <el-input v-model.trim="createIndexForm.key" placeholder="请输入索引字段" />
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button type="info" @click="showCreateIndexDialog = false">
          取消
        </el-button>
        <el-button type="primary" @click="createIndex">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<route lang="yaml">
name: 集合管理
meta:
  title: 集合管理
  index: 2-0
</route>
