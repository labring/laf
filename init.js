#! /usr/bin/env node

const { db, accessor } = require('./dist/lib/db')
const { hash } = require('./dist/lib/token')
const Config = require('./dist/config').default
const assert = require('assert')




async function main() {
  // 创建初始管理员
  const admin_id = await createFirstAdmin()

  // 创建 RBAC 初始角色
  const role_id = await createFirstRole()

  // 创建 RBAC 初始权限
  await createInitialPermissions()

  // 分配权限予角色
  await assignPermission2Role(role_id)

  // 分配角色于管理员
  await assginRole2Admin(role_id, admin_id)

  accessor.close()
}
main()


// 创建初始管理员
async function createFirstAdmin() {
  try {
    const username = Config.SUPER_ADMIN
    const password = hash(Config.SUPER_ADMIN_PASSWORD)

    const r_get = await db.collection('admin').get()
    assert(r_get.ok, 'query admin occurs error:' + r_get.error)
    if (r_get.data.length > 0) {
      console.log('already exists admin: ' + r_get.data[0].username)
      return r_get.data[0].uid
    }

    const r_add = await db.collection('base_user').add({ password })
    assert(r_add.ok, 'add base_user occurs error')

    const r_add_admin = await db.collection('admin').add({ uid: r_add.id, username })
    assert(r_add_admin.ok, 'add admin occurs error')

    return r_add.id
  } catch (error) {
    console.log(error.toString())
    return false
  }
}

// 创建初始角色
async function createFirstRole() {
  try {
    const r_get = await db.collection('role').get()
    assert(r_get.ok, 'query role occurs error:' + r_get.error)
    if (r_get.data.length > 0) {
      console.log('already exists role: ' + r_get.data[0].name)
      return r_get.data[0].id
    }

    const r_add = await db.collection('role').add({
      name: 'superadmin',
      label: 'Super Admin',
      description: 'role of super admin, created when initializing system'
    })

    assert(r_add.ok, 'add role occurs error')

    return r_add.id
  } catch (error) {
    console.log(error.toString())
    return false
  }
}

// 创建初始权限
async function createInitialPermissions() {
  const permissions = [
    { name: 'role.create', label: 'Create Role' },
    { name: 'role.read', label: 'Read Roles' },
    { name: 'role.edit', label: 'Edit Role' },
    { name: 'role.delete', label: 'Delete Role' },

    { name: 'permission.create', label: 'Create Permission' },
    { name: 'permission.read', label: 'Read Permissions' },
    { name: 'permission.edit', label: 'Edit Permission' },
    { name: 'permission.delete', label: 'Delete Permission' },

    { name: 'admin.create', label: 'Create Admin' },
    { name: 'admin.read', label: 'Read Admins' },
    { name: 'admin.edit', label: 'Edit Admin' },
    { name: 'admin.delete', label: 'Delete Admin' },
  ]

  for (const perm of permissions) {
    const coll = db.collection('permission')
    const r_get = await coll.where({ name: perm.name }).get()
    assert(r_get.ok, 'query permission failed: ' + perm.name)

    if (r_get.data.length > 0) {
      console.log('permission already exists: ' + r_get.data[0].name)
      continue
    }

    const r = await coll.add({
      name: perm.name,
      label: perm.label,
      description: perm.label
    })

    assert(r.ok, 'create permission failed: ' + perm.name)
  }

  return true
}

// 分配权限予角色
async function assignPermission2Role(role_id) {
  assert(role_id, 'role_id cannot be empty')

  const r = await db.collection('role_permission').get()
  assert(r.ok, 'query role_permission failed')

  const relations = r.data
  if (relations.length > 0) {
    console.log('relations of role & permission already exists')
    return false
  }

  const r_perm = await db.collection('permission').get()
  assert(r_perm.ok, 'query permissions failed')

  const permissions = r_perm.data

  for (const perm of permissions) {
    const r_add = await db.collection('role_permission').add({
      role_id,
      permission_id: perm.id
    })

    assert(r_add.ok, `add role_permission failed: role_id(${role_id}), permission_id(${perm.id})`)
  }
  return true
}

// 分配角色予管理员
async function assginRole2Admin(role_id, admin_id) {
  assert(role_id, 'role_id cannot be empty')
  assert(admin_id, 'admin_id cannot be empty')

  const r_count = await db.collection('user_role').where({ user_id: admin_id, role_id }).count()
  assert(r_count.ok, 'count user_role failed')

  if (r_count.total > 0) {
    console.log('admin already had a role')
    return false
  }

  const r = await db.collection('user_role').add({
    user_id: admin_id,
    role_id
  })

  assert(r.ok, 'add user_role failed')
  return true
}