<template>
  <div class="app-container">
    <el-button v-permission="'admin.create'" type="primary" @click="handleAddForm">创建管理员</el-button>
    <el-table :data="admins" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID" width="220">
        <template slot-scope="scope">
          {{ scope.row._id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="显示名称">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色">
        <template slot-scope="{ row }">
          <el-tag
            v-for="role in row.full_roles"
            :key="role.id"
            style="margin: 3px 5px"
          >
            {{ role.label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            v-permission="'admin.edit'"
            type="primary"
            size="small"
            @click="handleEdit(scope)"
          >修改</el-button>
          <el-button
            v-permission="'admin.delete'"
            type="danger"
            size="small"
            @click="handleDelete(scope)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单对话框 -->
    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType === 'edit' ? '修改管理员' : '创建管理员'"
    >
      <el-form :model="admin" label-width="100px" label-position="left">
        <el-form-item label="管理员标识">
          <el-input v-model="admin.username" placeholder="用户名" />
        </el-form-item>
        <el-form-item label="管理员密码">
          <el-input
            v-model="admin.password"
            type="password"
            :placeholder="dialogType === 'edit' ? '不修改则留空' : '管理员密码'"
          />
        </el-form-item>
        <el-form-item label="管理员名称">
          <el-input v-model="admin.name" placeholder="管理员名称" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="admin.roles" multiple placeholder="请选择角色">
            <el-option
              v-for="item in roles"
              :key="item.name"
              :label="item.label"
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
        <el-button type="primary" @click="confirmForm">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
import { db } from '@/api/cloud'
import * as user from '@/api/user'
import { array2map, mergeMap2ArrayByKeyArray } from '../../utils/array'

const defaultForm = {
  _id: undefined,
  username: '',
  name: '',
  password: '',
  roles: []
}

export default {
  name: 'AdminListPage',
  data() {
    return {
      admin: Object.assign({}, defaultForm),
      admins: [],
      dialogVisible: false,
      dialogType: 'new',
      roles: [] // 所有的角色列表
    }
  },
  computed: {

  },
  async created() {
    await this.getRoles()
    await this.getAdmins()
  },
  methods: {
    /** 获取管理员列表 */
    async getAdmins() {
      const res = await db.collection('__admins')
        .get()

      const rolesMap = array2map(this.roles, 'name')
      this.admins = mergeMap2ArrayByKeyArray(rolesMap, res.data, 'roles', 'full_roles')
    },
    /** 获取所有的角色列表 */
    async getRoles() {
      const res = await db.collection('__roles').get()
      this.roles = res.data || []
    },
    /** 打开添加表单  */
    handleAddForm() {
      this.admin = Object.assign({}, defaultForm)
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    /** 打开编辑表单 */
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.admin = { ...deepClone(scope.row), password: '' }
    },
    /** 删除数据 */
    handleDelete({ $index, row }) {
      this.$confirm('确定删除?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const { ok } = await db
            .collection('__admins')
            .where({ _id: row._id })
            .remove()
          if (!ok) return
          this.admins.splice($index, 1)
          this.$message({
            type: 'success',
            message: 'Delete succed!'
          })
        })
        .catch(err => {
          console.log(err)
        })
    },

    /** 编辑或新建 */
    async confirmForm() {
      const isEdit = this.dialogType === 'edit'

      if (isEdit) {
        const data = {
          _id: this.admin._id,
          username: this.admin.username,
          name: this.admin.name,
          roles: this.admin.roles
        }
        if (this.admin.password !== '') {
          data['password'] = this.admin.password
        }

        await user.edit(data)
        this.getAdmins()
      } else {
        const data = {
          username: this.admin.username,
          name: this.admin.name,
          password: this.admin.password,
          roles: this.admin.roles
        }
        await user.add(data)
        this.getAdmins()
      }

      const { username, name } = this.admin
      this.dialogVisible = false
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>管理员账户: ${username}</div>
            <div>管理员名称: ${name}</div>
          `,
        type: 'success'
      })
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
