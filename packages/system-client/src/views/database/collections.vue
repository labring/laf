<template>
  <div class="app-container">
    <!-- 记录 -->
    <div style="margin: 10px 0;">
      <el-input v-model.trim="listQuery._id" size="mini" placeholder="请输入_id查找" style="width:200px" :disabled="!collectionName" @keyup.enter.native="handleFilter" />
      <el-button size="mini" plain type="default" style="margin-left: 10px" icon="el-icon-search" :disabled="!collectionName" @click="handleFilter">搜索</el-button>
      <el-button size="mini" plain type="primary" style="margin-left: 10px" @click="showIndexesList = true">新建集合</el-button>
      <el-button size="mini" plain type="default" style="margin-left: 10px" :disabled="!collectionName" @click="showIndexesList = true">索引管理</el-button>
      <el-button size="mini" plain type="default" style="margin-left: 10px" :disabled="!collectionName" @click="showIndexesList = true">集合结构</el-button>
      <el-button size="mini" plain type="success" style="margin-left: 10px" icon="el-icon-plus" :disabled="!collectionName" @click="handleCreateRecord">添加记录</el-button>

    </div>
    <el-container v-show="tabType === 'record'" style="height: calc(100vh - 200px); border: 1px solid #eee">
      <el-aside width="240px" class="collection-list">
        <div class="label">选择集合</div>
        <el-radio-group v-model="collectionName" class="radio-group">
          <el-radio v-for="item in collections" :key="item.name" class="collection-radio" border size="medium" :label="item.name" />
        </el-radio-group>
      </el-aside>

      <el-container class="record-list">
        <div v-for="item in list" :key="item._id" class="record-item" :class="getClass(item)">
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
      :direction="direction"
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

    <!-- 添加/编辑文档表单 -->
    <el-drawer
      :title="formMode === 'edit' ? '编辑文档' : '添加文档'"
      size="50%"
      :visible.sync="showDocEditorForm"
      :direction="direction"
    >
      <el-header>
        <el-button size="mini" type="primary" :disabled="!collectionName" @click="formMode === 'edit' ? updateDocument() : addDocument()">保存</el-button>
      </el-header>
      <el-main>
        <json-editor v-model="record" class="db-editor" :line-numbers="true" :dark="false" :height="600" />
      </el-main>
    </el-drawer>

    <!-- 索引dialog -->
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

import { getCollections, getCollectionIndexes, deleCollectionIndex, setCollectionIndexes, getDb } from '@/api/collec'
import JsonEditor from '@/components/JsonEditor/param'
import MiniPagination from '@/components/Pagination/mini'

const db = getDb()

export default {
  name: 'CollectionManagement',
  components: { JsonEditor, MiniPagination },
  directives: {},
  filters: {},
  data() {
    return {
      collections: [],
      collectionName: '',
      tabType: 'record',
      listQuery: {
        limit: 10,
        page: 1
      },
      list: [],
      indexes: [],
      total: 0,
      record: {},
      // newRecord: {},
      showCreateIndexDialog: false,
      showDocEditorForm: false,
      showIndexesList: false,
      formMode: 'edit',
      createIndexForm: {}
    }
  },
  watch: {
    collectionName(val) {
      if (val) {
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
      const ret = await getCollections()
      this.collections = ret || []
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

    getClass(val) {
      let record = this.record
      const isString = typeof (record) === 'string'

      if (isString) record = JSON.parse(record)

      return val._id === record._id ? 'active' : ''
    },
    async deleRecord(record) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      await db.collection(this.collectionName)
        .where({ _id: record._id })
        .remove()
    },

    handleEditRecord(val) {
      this.record = val
      this.formMode = 'edit'
      this.showDocEditorForm = true
    },
    async updateDocument() {
      await this.$confirm('确认要更新数据？', '确认')
      const record = typeof this.record === 'string' ? JSON.parse(this.record) : this.record

      const { _id, ...params } = record
      if (!_id) return

      const ret = await db
        .collection(this.collectionName)
        .doc(_id)
        .set({ ...params })

      if (ret) {
        this.$message('更新成功')
        this.getList()
      }
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
          .add({
            ...params,
            created_at: Date.now()
          })

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

        this.getList()
        this.showDocEditorForm = false
      } catch (error) {
        this.$notify({
          type: 'error',
          message: '创建失败！' + error
        })
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
    // height: calc(100vh - 200px);
    overflow-y: scroll;

    .record-item {
      display: flex;
      justify-content: space-between;
      border: 1px solid #eee;
      margin-bottom: 10px;
      padding: 0 8px;
      border-radius: 3px;
      .doc {
        flex: 1
      }
      .tools {
        width: 160px;
        text-align: right;
        padding-top: 15px;
        .tools-btn {
          // margin-left: 10px;
        }
      }
    }

    .record-item.active {
      border: 1px solid rgb(232, 180, 10);
    }
  }
</style>
