<template>
  <div class="app-container">
    <el-button plain type="default" @click="loadCollaborators">刷新</el-button>
    <el-button plain type="success" @click="showAddForm">添加协作者</el-button>
    <el-table :data="collaborators" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row.uid }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名">
        <template slot-scope="{row}">
          <span v-if="row.user && row.user.username">{{ row.user.username }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="姓名">
        <template slot-scope="{row}">
          <span v-if="row.user && row.user.name">{{ row.user.name }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色">
        <template slot-scope="{ row }">
          <el-tag
            v-for="role in row.roles"
            :key="role.id"
            style="margin: 3px 5px"
          >
            {{ role }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="{row}">
          <el-button
            plain
            type="info"
            size="mini"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      title="协作者"
    >
      <el-form v-loading="loading" :model="form" label-width="100px" label-position="left">
        <el-form-item label="用户名">
          <el-input v-model="form.username" style="width: 300px;" placeholder="请输入对方用户名" />
          <el-button plain type="primary" style="margin-left: 10px;" size="medium" @click="search">搜索</el-button>
        </el-form-item>
        <el-form-item v-if="form.user" label="用户">
          {{ form.user.name }} ({{ form.user.username }})
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.roles" multiple placeholder="请选择角色">
            <el-option
              v-for="item in roles"
              :key="item.name"
              :label="item.name"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="info"
          @click="dialogVisible = false"
        >取消
        </el-button>
        <el-button type="primary" @click="handleCreate">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAllApplicationRoles, getCollaborators, inviteCollaborator, removeCollaborator } from '@/api/application'
import { searchUserByUsername } from '@/api/application'
import { showError, showInfo, showSuccess } from '@/utils/show'

const defaultForm = {
  uid: undefined,
  username: '',
  user: null,
  roles: []
}

export default {
  name: 'CollaboratorListPage',
  data() {
    return {
      form: Object.assign({}, defaultForm),
      collaborators: [],
      dialogVisible: false,
      dialogType: 'new',
      roles: [],
      loading: false
    }
  },
  async created() {
    await this.getRoles()
    await this.loadCollaborators()
  },
  methods: {
    async getRoles() {
      this.loading = true
      const res = await getAllApplicationRoles()
        .finally(() => { this.loading = false })

      this.roles = res.data
    },
    async loadCollaborators() {
      this.loading = true
      const res = await getCollaborators()
        .finally(() => { this.loading = false })

      this.collaborators = res.data
    },
    async search() {
      this.loading = true
      if (!this.form.username) { return }
      const res = await searchUserByUsername(this.form.username)
        .finally(() => { this.loading = false })
      if (!res.data) { return showInfo('无此用户') }
      this.form.user = res.data
    },
    showAddForm() {
      this.form = Object.assign({}, defaultForm)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    async handleCreate() {
      if (!this.form.user) return showError('请选择协作者')
      if (!this.form.roles?.length) { return showError('请选择协作者角色') }

      // 不可为应用创建者
      const app = this.$store.state.app.application
      if (this.form.user._id === app.created_by) { return showError('协作者已是应用的创建') }

      // 不可重复添加
      const exists = this.collaborators.filter(co => co.uid === this.form.user._id)
      if (exists.length) { return showError('协作者已经存在') }

      this.loading = true
      const res = await inviteCollaborator(this.form.user?._id, this.form.roles)
        .finally(() => { this.loading = false })

      if (res.error) { return showError(res.error) }
      this.$message.success('操作成功')
      this.dialogVisible = false
      this.loadCollaborators()
    },
    async handleDelete(row) {
      await this.$confirm(`确定删除该协作者: ${row.user.name}？`)
      const uid = row.uid

      this.loading = true
      const res = await removeCollaborator(uid)
        .finally(() => { this.loading = false })

      if (res.error) showError('出错了:' + res.error)
      showSuccess('操作成功')
      this.loadCollaborators()
    },
    getRoleLabel(role_name) {
      switch (role_name) {
        case 'owner':
          return '应用管理员'
        case 'dba':
          return '数据管理员'
        case 'developer':
          return '开发者'
        case 'operator':
          return '运维工程师'
      }
      return role_name
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .admin-tree {
    margin-bottom: 30px;
  }
}
</style>
