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
    <el-table v-loading="loading" empty-text="-" :data="applications.created" style="width: 100%;margin-top:10px;" stripe>
      <el-table-column align="center" label="App ID" width="320">
        <template slot-scope="scope">
          <div class="table-row">
            <div> {{ scope.row.appid }}</div>
            <i v-clipboard:message="scope.row._id" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="应用名" width="300">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="App Secret" width="300">
        <template slot-scope="scope">
          <div class="table-row">
            <div class="app-secret">{{ scope.row.app_secret }}</div>
            <i v-clipboard:message="scope.row.app_secret" v-clipboard:success="onCopy" class="el-icon-document-copy copy-btn" />
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="Status" width="300">
        <template slot-scope="scope">
          {{ scope.row.status }}
        </template>
      </el-table-column>
      <el-table-column label="创建/更新时间" align="center">
        <template slot-scope="{row}">
          <span v-if="row.created_at">{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="380" class-name="small-padding">
        <template slot-scope="{row,$index}">
          <el-button plain type="primary" size="mini" @click="toDetail(row)">
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
    toDetail(app) {
      const route_url = this.$router.resolve({
        path: `/app/${app.appid}/dashboard/index`
      })
      window.open(route_url.href, '_blank')
      // this.$router.push({
      //   path: `/app/${app.appid}/dashboard/index`
      // })
    },
    async deleteApp() {
      this.$message('尚未实现此功能')
    },
    onCopy() {
      this.$message.success('已复制')
    }
  }
}
</script>

<style scoped>
.application-container {
  padding: 20px;
  width: calc(100vw - 30px);
  margin: 15px auto;
  box-shadow: -1px -1px 5px 0 rgb(0 0 0 / 10%);
  background: white;
}

.table-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.app-secret {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 240px;
}

.copy-btn {
    display: block;
    font-size: 16px;
    margin-left: 10px;
    cursor: pointer;
}
</style>
