#! /usr/bin/env node

const Config = require('./dist/config').default
const { hash } = require('./dist/lib/token')
const assert = require('assert')
const { MongoAccessor, getDb } = require('less-api')


const accessor = new MongoAccessor(Config.db.database, Config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

db = getDb(accessor)

async function main() {
  await accessor.init()

  // 创建 RBAC 初始权限
  await createInitialPermissions()


  // 创建 RBAC 初始角色
  const role_id = await createFirstRole()


  // 创建初始管理员
  const admin_id = await createFirstAdmin()

  accessor.close()
}
main()


// 创建初始管理员
async function createFirstAdmin() {
  try {
    const username = Config.SUPER_ADMIN
    const password = hash(Config.SUPER_ADMIN_PASSWORD)

    const { total } = await db.collection('admins').count()
    if (total > 0) {
      console.log('admin already exists')
      return
    }

    await accessor.db.collection('admins').createIndex('username', { unique: true })
    await accessor.db.collection('admins').createIndex('uid', { unique: true })


    const r_add = await db.collection('base_user').add({ password })
    assert(r_add.ok, 'add base_user occurs error')


    const { data } = await db.collection('roles').get()
    const roles = data.map(it => it.name)

    const r_add_admin = await db.collection('admins').add({
      uid: r_add.id,
      username,
      avatar: "https://work.zhuo-zhuo.com/file/data/23ttprpxmavkkuf6nttc/PHID-FILE-vzv6dyqo3ev2tmngx7mu/logoL)",
      name: 'Admin',
      roles
    })
    assert(r_add_admin.ok, 'add admin occurs error')

    return r_add.id
  } catch (error) {
    console.error(error.message)
  }
}

// 创建初始角色
async function createFirstRole() {
  try {

    await accessor.db.collection('roles').createIndex('name', { unique: true })

    const r_perm = await db.collection('permissions').get()
    assert(r_perm.ok, 'get permissions failed')

    const permissions = r_perm.data.map(it => it.name)

    const r_add = await db.collection('roles').add({
      name: 'superadmin',
      label: '超级管理员',
      description: '系统初始化的超级管理员',
      permissions
    })

    assert(r_add.ok, 'add role occurs error')

    return r_add.id
  } catch (error) {
    if (error.code == 11000) {
      return console.log('permissions already exists')
    }

    console.error(error.message)
  }
}

// 创建初始权限
async function createInitialPermissions() {
  const permissions = [
    { name: 'role.create', label: '创建角色' },
    { name: 'role.read', label: '读取角色' },
    { name: 'role.edit', label: '编辑角色' },
    { name: 'role.delete', label: '删除角色' },

    { name: 'permission.create', label: '创建权限' },
    { name: 'permission.read', label: '读取权限' },
    { name: 'permission.edit', label: '编辑权限' },
    { name: 'permission.delete', label: '删除权限' },

    { name: 'admin.create', label: '创建管理员' },
    { name: 'admin.read', label: '获取管理员' },
    { name: 'admin.edit', label: '编辑管理员' },
    { name: 'admin.delete', label: '删除管理员' },
  ]

  // 创建唯一索引
  await accessor.db.collection('permissions').createIndex('name', { unique: true })

  try {
    await db.collection('permissions').add(permissions, { multi: true })
  } catch (error) {
    if (error.code == 11000) {
      return console.log('permissions already exists')
    }

    console.error(error.message)
  }

  return true
}