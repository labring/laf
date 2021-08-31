<template>
  <div class="app-container">
    <div class="collec-wrap">
      <div class="filter-container">
        集合名称：
        <el-select v-model="collectionName" size="mini" filterable placeholder="请选择集合">
          <el-option
            v-for="item in collections"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </div>

      <div style="text-align: center;">
        <el-radio-group v-model="tabType" size="mini" style="margin-left: 30px;">
          <el-radio-button label="record">记录列表</el-radio-button>
          <el-radio-button label="index">索引管理</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 记录 -->
      <div v-show="tabType === 'record'" style="margin: 10px 0;">
        <el-input v-model.trim="listQuery._id" size="mini" placeholder="请输入_id查找" style="width:200px" :disabled="!collectionName" @keyup.enter.native="handleFilter" />
        <el-button size="mini" type="primary" style="margin-left: 10px" icon="el-icon-search" :disabled="!collectionName" @click="handleFilter">搜索记录</el-button>
        <el-button size="mini" type="primary" style="margin-left: 10px" icon="el-icon-plus" :disabled="!collectionName" @click="handleCreateRecord">添加记录</el-button>
      </div>
      <el-container v-show="tabType === 'record'" style="height: calc(100vh - 240px); border: 1px solid #eee">
        <el-aside width="300px" style="background-color: #fff;border: 1px solid #eee;padding: 8px;">
          <div v-for="item in list" :key="item._id" class="record-item" :class="getClass(item)" @click="getRecord(item)">
            <span class="">_id: {{ item._id }}</span>
            <el-button size="mini" class="close" icon="el-icon-close" circle @click="deleRecord(item)" />
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
        </el-aside>

        <el-container>
          <el-header>
            <el-button size="mini" type="primary" :disabled="!collectionName" @click="updateRecord">更新</el-button>
          </el-header>
          <el-main>
            <json-editor v-model="record" class="db-editor" :line-numbers="true" :dark="false" :height="600" />
          </el-main>
        </el-container>
      </el-container>

      <!-- 索引 -->
      <div v-show="tabType === 'index'">
        <div style="margin: 10px 0;">
          <el-button type="primary" style="margin-left: 10px" icon="el-icon-plus" :disabled="!collectionName" @click="handleCreateIndex">创建索引</el-button>
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

      <!-- 记录dialog -->
      <el-dialog title="添加记录" :visible.sync="showCreateRecordDialog">
        <json-editor v-model="newRecord" :dark="true" :height="500" />
        <div style="text-align:right;margin-top: 10px;">
          <el-button
            type="info"
            @click="showCreateRecordDialog = false"
          >
            取消
          </el-button>
          <el-button type="primary" @click="addRecord">确认</el-button>
        </div>
      </el-dialog>

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
  </div>
</template>

<script>
import { dbm_cloud } from '@/api/cloud'
import { getCollections, getCollectionIndexes, deleCollectionIndexe, setCollectionIndexes } from '@/api/collec'
// import { TYPES } from '@/utils/types'

import MiniPagination from '@/components/Pagination/mini'
import JsonEditor from '@/components/JsonEditor/param'

const db = dbm_cloud.database()

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
      newRecord: {},
      showCreateIndexDialog: false,
      showCreateRecordDialog: false,
      createIndexForm: {}
    }
  },
  watch: {
    collectionName(val) {
      if (val) {
        this.getList()
        this.getIndexes()
        this.getRecord({})
      }
    },
    'listQuery.page'() {
      this.getRecord({})
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

    async deleRecord(record) {
      await this.$confirm('确认要删除此数据？', '删除确认')

      await db.collection(this.collectionName)
        .where({ _id: record._id })
        .remove()
    },

    getRecord(val) {
      this.record = val
    },

    getClass(val) {
      let record = this.record
      const isString = typeof (record) === 'string'

      if (isString) record = JSON.parse(record)

      return val._id === record._id ? 'active' : ''
    },

    async updateRecord() {
      await this.$confirm('确认要更新数据？', '确认')
      const record = typeof this.record === 'string' ? JSON.parse(this.record) : this.record

      const { _id, ...params } = record
      if (!_id) return

      Reflect.deleteProperty(params, 'created_at')

      const ret = await db
        .collection(this.collectionName)
        .where({
          _id: _id
        })
        .update({ ...params, updated_at: Date.now() })

      if (ret) {
        this.$message('更新成功')
        this.getList()
      }
    },

    async addRecord() {
      try {
        const params = JSON.parse(this.newRecord)
        const r = await db.collection(this.collectionName)
          .add({
            ...params,
            created_at: Date.now(),
            updated_at: Date.now()
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
        this.showCreateRecordDialog = false
      } catch (error) {
        this.$notify({
          type: 'error',
          message: '创建失败！' + error
        })
      }
    },

    async getIndexes() {
      const ret = await getCollectionIndexes(this.collectionName)
      this.indexes = ret
    },

    async deleIndex(index) {
      await this.$confirm('确认要删除此数据？', '删除确认')
      await deleCollectionIndexe(this.collectionName, index.name)

      this.$message('删除成功')
      this.getIndexes()
    },

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

    handleCreateRecord() {
      this.showCreateRecordDialog = true
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

  .el-aside {
    color: #333;
    .record-item {
      padding: 6px;
      font-size: 14px;
      color: #666;
      margin: 4px 0;
      cursor:pointer;
      background: #f2f2f2;
      position: relative;

      .close {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%)
      }
    }
    .record-item.active {
      color: blue;
    }
  }

  .el-main {
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    // .db-editor {
      // border: 1px solid lightgray
    // }
  }
</style>
