<template>
  <div class="app-container">
    <!-- 记录 -->
    <div style="margin: 10px 0;">
      <el-input v-model.trim="listQuery._id" size="mini" placeholder="请输入_id查找" style="width:200px" :disabled="!collectionName" @keyup.enter.native="handleFilter" />
      <el-button size="mini" plain type="default" style="margin-left: 10px" icon="el-icon-search" :disabled="!collectionName" @click="handleFilter">搜索</el-button>
      <el-button size="mini" plain type="primary" style="margin-left: 10px" @click="showCreateCollectionForm = true">新建集合</el-button>
      <el-button size="mini" plain type="default" style="margin-left: 10px" :disabled="!collectionName" @click="showIndexesList = true">索引管理</el-button>
      <el-button size="mini" plain type="default" style="margin-left: 10px" :disabled="!collectionName" @click="handleShowCollectinoSchema">集合结构</el-button>
      <el-button size="mini" plain type="success" style="margin-left: 10px" icon="el-icon-plus" :disabled="!collectionName" @click="handleCreateRecord">添加记录</el-button>
      <el-button v-clipboard:message="collectionName" v-clipboard:success="onCopy" size="mini" plain type="default" style="margin-left: 10px" :disabled="!collectionName">复制名称</el-button>
    </div>
    <el-container style="height: calc(100vh - 140px); border: 1px solid #eee">
      <el-aside width="240px" class="collection-list">
        <div class="label">
          选择集合
          <el-button :loading="loading" size="medium" circle type="text" style="margin-left: 10px" icon="el-icon-refresh" @click="getCollections" />
        </div>
        <el-radio-group v-model="collectionName" class="radio-group">
          <el-radio
            v-for="item in collections"
            :key="item.name"
            class="collection-radio"
            border
            size="medium"
            :label="item.name"
          />
        </el-radio-group>
      </el-aside>

      <el-container class="record-list">
        <div v-for="item in list" :key="item._id.toString()" class="record-item" :class="getClass(item)">
          <div class="doc">
            <pre class="">{{ item }}</pre>
          </div>
          <div class="tools">
            <el-button plain class="tools-btn" size="mini" type="primary" @click="handleEditRecord(item)">编辑</el-button>
            <el-button plain class="tools-btn" size="mini" type="danger" @click="deleRecord(item)">删除</el-button>
          </div>
        </div>
        <div style="text-align: center;">
          <MiniPagination
            v-show="total>0"
            layout="prev, pager, next"
            :total="total"
            :background="true"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.limit"
            @pagination="getList"
          />
        </div>
      </el-container>
    </el-container>

    <!-- 索引管理 -->
    <el-drawer
      title="索引管理"
      size="50%"
      :visible.sync="showIndexesList"
    >
      <div>
        <div style="margin: 10px 0;">
          <el-button size="mini" plain type="primary" style="margin-left: 10px" icon="el-icon-plus" :disabled="!collectionName" @click="handleCreateIndex">创建索引</el-button>
        </div>
        <el-table :data="indexes" border style="width: 100%">
          <el-table-column prop="name" label="索引名称" align="center" />
          <el-table-column label="索引属性" align="center">
            <template slot-scope="{row}">
              {{ row.unique ? '唯一' : '非唯一' }}
            </template>
          </el-table-column>
          <el-table-column label="索引字段" align="center">
            <template slot-scope="{row}">
              {{ Object.keys(row.key)[0] }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template slot-scope="{row}">
              <el-button size="mini" type="danger" @click="deleIndex(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 编辑集合数据结构 -->
    <el-drawer
      :title="'集合数据结构:' + collectionName"
      size="50%"
      :visible.sync="showCollectionSchemaForm"
    >
      <el-header>
        <el-button :loading="loading" size="mini" type="primary" :disabled="!collectionName" @click="updateCollectionSchema">保存</el-button>
      </el-header>
      <el-main>
        <json-editor v-model="collectionSchemaForm.schema" class="db-editor" :line-numbers="true" :dark="false" :height="600" />
      </el-main>
    </el-drawer>

    <!-- 添加/编辑文档表单 -->
    <el-drawer
      :title="formMode === 'edit' ? '编辑文档' : '添加文档'"
      size="50%"
      :visible.sync="showDocEditorForm"
    >
      <el-header>
        <el-button size="mini" type="primary" :disabled="!collectionName" @click="formMode === 'edit' ? updateDocument() : addDocument()">保存</el-button>
      </el-header>
      <el-main>
        <json-editor v-model="record" class="db-editor" :line-numbers="true" :dark="false" :height="600" />
      </el-main>
    </el-drawer>

    <!-- 创建集合表单 -->
    <el-dialog title="创建集合" :visible.sync="showCreateCollectionForm" width="500px">
      <el-form :model="createCollectionForm" label-width="80px" style="width:460px">
        <el-form-item label="集合名称">
          <el-input v-model="createCollectionForm.collectionName" placeholder="请输入新集合名称" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          size="mini"
          type="default"
          @click="showCreateCollectionForm = false"
        >
          取消
        </el-button>
        <el-button size="mini" type="primary" @click="handleCreateCollection">确认</el-button>
      </div>
    </el-dialog>

    <!-- 创建索引表单 -->
    <el-dialog title="创建索引" :visible.sync="showCreateIndexDialog">
      <el-form :model="createIndexForm" label-width="100px" style="width:600px">
        <el-form-item label="索引名称">
          <el-input v-model="createIndexForm.name" placeholder="请输入索引名称" />
        </el-form-item>
        <el-form-item label="索引属性">
          <el-radio-group v-model="createIndexForm.unique">
            <el-radio :label="true">唯一</el-radio>
            <el-radio :label="false">非唯一</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="索引字段" style="width: 250px">
          <el-input v-model.trim="createIndexForm.key" placeholder="请输入索引字段" />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="info"
          @click="showCreateIndexDialog = false"
        >
          取消
        </el-button>
        <el-button type="primary" @click="createIndex">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import { getCollections, getCollectionIndexes, deleCollectionIndex, setCollectionIndexes, getDb, createCollection, updateCollection } from '@/api/collec'
import JsonEditor from '@/components/JsonEditor/param'
import MiniPagination from '@/components/Pagination/mini'
import { showError, showSuccess } from '@/utils/show'
import { EJSON } from 'bson'

const db = getDb()

export default {
  name: 'CollectionManagement',
  components: { JsonEditor, MiniPagination },
  directives: {},
  filters: {},
  data() {
    return {
      loading: false,
      collections: [],
      collectionName: '',

      // 文档列表相关
      listQuery: {
        limit: 10,
        page: 1
      },
      list: [],
      indexes: [],
      total: 0,

      // 添加/编辑文档表单
      record: {},
      formMode: 'edit', // doc editor form mode
      showCreateIndexDialog: false,
      showDocEditorForm: false,
      createIndexForm: {},
      showIndexesList: false,

      // 创建集合表单
      showCreateCollectionForm: false,
      createCollectionForm: {
        collectionName: ''
      },

      // 管理集合结构表单
      showCollectionSchemaForm: false,
      collectionSchemaForm: {
        schema: null
      }
    }
  },
  watch: {
    collectionName(val) {
      if (val) {
        this.listQuery.page = 1
        this.getList()
        this.getIndexes()
      }
    }
  },
  async created() {
    await this.getCollections()
  },
  methods: {
    async getCollections() {
      this.loading = true
      let ret = await getCollections()
        .finally(() => { this.loading = false })

      ret = ret.filter(it => {
        if (it.name.endsWith('.chunks')) return false
        if (it.name.endsWith('.files')) return false
        return true
      })
      const sorted = (ret || []).sort((a, b) => a.name.localeCompare(b.name))
      this.collections = sorted
    },

    // 搜索
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    async getList() {
      const collectionName = this.collectionName
      if (!collectionName) return

      const { limit, page, _id } = this.listQuery

      const query = _id ? { _id } : {}

      // 执行数据查询
      const res = await db.collection(collectionName)
        .where(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .get()

      this.list = res.data

      // 获取数据总数
      const { total } = await db.collection(collectionName)
        .where(query)
        .count()

      this.total = total
    },
    async handleCreateCollection() {
      const collectionName = this.createCollectionForm.collectionName
      if (!collectionName) {
        return showError('集合名不可为空')
      }

      await createCollection(collectionName)
        .then(res => {
          showSuccess('集合创建成功！')
          this.getCollections()
        })
        .catch(err => {
          console.error(err.response.data)
          if (err.response?.data?.code === 'NamespaceExists') {
            showError('错误：该集合已存在')
          } else {
            showError('创建集合失败: ' + err.response?.data?.error)
          }
        })
        .finally(() => {
          this.createCollectionForm.collectionName = ''
          this.showCreateCollectionForm = false
        })
    },
    async handleShowCollectinoSchema() {
      const deulfaSchema = {
        'bsonType': 'object',
        'required': [],
        'properties': {
          '_id': {
            'description': 'ID，系统自动生成'
          }
        }
      }
      // find the collection schema
      const [collection] = this.collections.filter(coll => coll.name === this.collectionName)
      if (!collection) return

      const schema = collection.options?.validator?.$jsonSchema
      this.collectionSchemaForm.schema = schema || deulfaSchema
      this.showCollectionSchemaForm = true
    },
    async updateCollectionSchema() {
      await this.$confirm('确认要更新集合结构？', '确认')
      const collectionName = this.collectionName
      if (!collectionName) return

      const schema = this.collectionSchemaForm.schema
      const schemaData = typeof schema === 'string' ? JSON.parse(schema) : schema

      this.loading = true
      await updateCollection(collectionName, schemaData)
        .then(res => {
          showSuccess('集合更新成功')
          this.getCollections()
        })
        .catch(err => {
          console.error(err.response.data)
          showError('更新集合失败: ' + err.response?.data?.error)
        })
        .finally(() => { this.loading = false })
    },
    getClass(val) {
      let record = this.record
      const isString = typeof (record) === 'string'
      try {
        if (isString) record = JSON.parse(record)
      } catch (error) {
        return
      }

      return val._id === record._id ? 'active' : ''
    },
    async deleRecord(record) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      await db.collection(this.collectionName)
        .where({ _id: record._id })
        .remove()

      this.getList()
    },
    handleEditRecord(val) {
      this.record = EJSON.serialize(val)
      this.formMode = 'edit'
      this.showDocEditorForm = true
    },
    async updateDocument() {
      await this.$confirm('确认要更新数据？', '确认')
      // 将 [EJSON字符串] 解析为 [JSON对象]
      const parsed = typeof this.record === 'string' ? JSON.parse(this.record) : this.record

      // 将 [JSON对象] 序列化为 [EJSON对象]
      const serialized = EJSON.deserialize(parsed)
      const { _id, ...params } = serialized

      if (!_id) return

      const r = await db
        .collection(this.collectionName)
        .where({ _id })
        .update({ ...params }, { merge: false })

      if (r.error) {
        const message = typeof r.error !== 'string' ? JSON.stringify(r.error) : r.error
        return showError('更新失败: ' + message)
      }

      showSuccess('更新成功')
      this.getList()
    },
    handleCreateRecord() {
      this.formMode = 'create'
      this.record = {}
      this.showDocEditorForm = true
    },
    async addDocument() {
      try {
        const params = JSON.parse(this.record)
        const r = await db.collection(this.collectionName)
          .add({ ...params })

        if (r.error) {
          const message = typeof r.error !== 'string' ? JSON.stringify(r.error) : r.error
          return showError('添加失败: ' + message)
        }

        showSuccess('添加成功')
        this.getList()
        this.showDocEditorForm = false
      } catch (error) {
        showError('创建失败！' + error)
      }
    },
    /**
     * 获取集合索引列表
     */
    async getIndexes() {
      if (!this.collectionName) return
      const ret = await getCollectionIndexes(this.collectionName)
      this.indexes = ret
    },
    /**
     * 删除索引
     */
    async deleIndex(index) {
      await this.$confirm('确认要删除此数据？', '删除确认')
      await deleCollectionIndex(this.collectionName, index.name)

      this.$message('删除成功')
      this.getIndexes()
    },

    /**
     * 创建索引
     */
    async createIndex() {
      const form = this.createIndexForm
      const keyName = form.key
      const params = {
        'spec': {
          [keyName]: 1
        },
        'unique': form.unique
      }
      await setCollectionIndexes(this.collectionName, params)

      this.$message('创建成功')
      this.showCreateIndexDialog = false
      this.getIndexes()
    },
    handleCreateIndex() {
      this.showCreateIndexDialog = true
    },
    onCopy() {
      this.$message.success('集合名已复制！')
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-header {
    background-color: #B3C0D1;
    color: #333;
    line-height: 60px;
  }

  .collection-list {
      background-color: #fff;
      padding: 8px;
      box-sizing: border-box;

    .label {
      font-size: 14px;
      color: gray;
      margin-bottom: 10px;
    }

    .radio-group {
      width: 100%;
      overflow-y: scroll;
      overflow-x: hidden;
    }

    .radio-group::-webkit-scrollbar {
        display: none;
    }

    .collection-radio {
      width: 90%;
      margin-bottom: 8px;
      margin-left: 0 !important;
    }
  }

  .record-list {
    display: flex;
    flex-direction: column;
    padding: 3px;
    width: 100%;
    overflow-y: scroll;

    .record-item {
      display: flex;
      justify-content: space-between;
      border: 1px solid #eee;
      margin-bottom: 10px;
      padding: 0 8px;
      border-radius: 3px;
      .doc {
        flex: 1;
        max-width: 85%;

        pre {
          width: 100%;
          text-overflow: ellipsis;
          overflow-x: hidden;
          overflow-y: auto;
          max-height: 200px;
        }
      }
      .tools {
        width: 15%;
        text-align: right;
        padding-top: 15px;
      }
    }

    .record-item.active {
      border: 1px solid rgb(232, 180, 10);
    }
  }
</style>
