<template>
  <div class="app-container">
    <el-button v-permission="'role.create'" type="primary" @click="handleAddRole">创建角色</el-button>

    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="ID">
        <template slot-scope="scope">
          {{ scope.row._id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色标识">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="显示名称">
        <template slot-scope="scope">
          {{ scope.row.label }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="描述">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>
      <el-table-column align="left" label="权限" min-width="300">
        <template slot-scope="{ row }">
          <el-tag
            v-for="perm in row.full_permissions"
            :key="perm._id"
            style="margin: 3px 6px"
          >
            {{ perm.label }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            v-permission="'role.edit'"
            type="primary"
            size="small"
            @click="handleEdit(scope)"
          >修改</el-button>
          <el-button
            v-permission="'role.delete'"
            type="danger"
            size="small"
            @click="handleDelete(scope)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      :visible.sync="dialogVisible"
      :title="dialogType === 'edit' ? '修改角色' : '创建角色'"
    >
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色标识">
          <el-input v-model="role.name" placeholder="唯一标识，为字母" />
        </el-form-item>
        <el-form-item label="角色名称">
          <el-input v-model="role.label" placeholder="角色显示名称" />
        </el-form-item>
        <el-form-item label="角色权限">
          <el-select v-model="role.permissions" multiple placeholder="请选择角色" collapse-tags filterable>
            <el-option
              v-for="item in permissions"
              :key="item.name"
              :label="item.label"
              :value="item.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="role.description"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button
          type="info"
          @click="dialogVisible = false"
        >
          取消
        </el-button>
        <el-button type="primary" @click="confirmRole">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { deepClone } from '@/utils'
// import { mergeMap2ArrayByKeyArray, array2map } from '@/utils/array'

const defaultForm = {
  _id: undefined,
  name: '',
  label: '',
  description: '',
  permissions: []
}

export default {
  name: 'RoleListPage',
  data() {
    return {
      role: Object.assign({}, defaultForm),
      rolesList: [],
      dialogVisible: false,
      dialogType: 'new',
      permissions: []
    }
  },
  created() {
    this.getRoles()
  },
  methods: {
    async getRoles() {
      // const res = await db.collection(Constants.cn.roles).get()
      // const { data: permissions } = await db.collection(Constants.cn.permissions).get()
      // this.permissions = permissions
      // const permsMap = array2map(permissions, 'name')
      // this.rolesList = mergeMap2ArrayByKeyArray(permsMap, res.data, 'permissions', 'full_permissions')
    },
    handleAddRole() {
      this.role = Object.assign({}, defaultForm)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.role = deepClone(scope.row)
    },
    handleDelete({ $index, row }) {
      // this.$confirm('确定删除角色?', 'Warning', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // })
      //   .then(async() => {
      //     const r = await db.collection(Constants.cn.roles)
      //       .where({ name: row.name })
      //       .remove()
      //     if (!r.ok) return
      //     this.rolesList.splice($index, 1)
      //     this.$message({
      //       type: 'success',
      //       message: '删除成功!'
      //     })
      //   })
      //   .catch(err => {
      //     console.error(err)
      //   })
    },
    async confirmRole() {
      // const isEdit = this.dialogType === 'edit'

      // if (isEdit) {
      //   const { ok } = await db.collection(Constants.cn.roles)
      //     .where({ _id: this.role._id })
      //     .update({
      //       name: this.role.name,
      //       label: this.role.label,
      //       description: this.role.description,
      //       permissions: this.role.permissions
      //     })
      //   if (!ok) return
      //   this.getRoles()
      // } else {
      //   const { ok } = await db.collection(Constants.cn.roles).add(this.role)
      //   if (!ok) return
      //   this.getRoles()
      // }

      // const { description, name, label } = this.role
      // this.dialogVisible = false
      // this.$notify({
      //   title: 'Success',
      //   dangerouslyUseHTMLString: true,
      //   message: `
      //       <div>角色标识: ${name}</div>
      //       <div>角色名称: ${label}</div>
      //       <div>描述: ${description}</div>
      //     `,
      //   type: 'success'
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
