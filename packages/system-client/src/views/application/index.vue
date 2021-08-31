<template>
  <div class="application-container">
    <div class="controls">
      <el-button plain type="default" size="mini" icon="el-icon-refresh" @click="loadApps">
        刷新
      </el-button>
      <el-button plain type="primary" size="mini" icon="el-icon-plus" @click="deleteApp">
        新建
      </el-button>
    </div>
    <el-table v-loading="loading" :data="applications.created" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="App ID" width="220">
        <template slot-scope="scope">
          {{ scope.row._id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用名" width="220">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="App Secret">
        <template slot-scope="scope">
          {{ scope.row.app_secret }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="100">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="创建/更新时间" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
          <br>
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="380" class-name="small-padding">
        <template slot-scope="{row,$index}">
          <el-button plain type="primary" size="mini" @click="showUpdateForm(row)">
            编辑
          </el-button>
          <el-button plain type="primary" size="mini" @click="showUpdateForm(row)">
            管理
          </el-button>
          <el-button plain size="mini" type="danger" @click="handleDelete(row,$index)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getMyApplications } from '@/api/application'

export default {
  name: 'Applications',
  components: { },
  data() {
    return {
      applications: {
        created: [],
        joined: []
      },
      loading: false
    }
  },
  async created() {
    this.loadApps()
  },
  methods: {
    async loadApps() {
      this.loading = true
      const res = await getMyApplications()
        .finally(() => { this.loading = false })
      const { created, joined } = res.data
      this.applications.created = created
      this.applications.joined = joined
    },
    async deleteApp() {
      this.$message('尚未实现此功能')
    }
  }
}
</script>

<style scoped>
.application-container {
  padding: 20px;
}
</style>
