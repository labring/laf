#! /usr/bin/env node

const Config = require('../dist/config').default
const { hashPassword } = require('../dist/lib/utils/hash')
const assert = require('assert')
const { MongoAccessor, getDb } = require('less-api')
const adminRules = require('./rules/app-admin.json')
const appRules = require('./rules/app.json')
const { permissions } = require('./sys-permissions')
const { FunctionLoader } = require('./func-loader')
const { Constants } = require('../dist/constants')
const { Globals } = require('../dist/lib/globals')
const { publishFunctions } = require('../dist/api/function')
const { publishAccessPolicy } = require('../dist/api/rules')

const sys_accessor = Globals.sys_accessor

const db = getDb(sys_accessor)

const app_accessor = Globals.app_accessor

const app_db = getDb(app_accessor)


async function main() {
  await sys_accessor.ready
  await app_accessor.ready

  // 创建 RBAC 初始权限
  await createInitialPermissions()


  // 创建 RBAC 初始角色
  await createFirstRole()


  // 创建初始管理员
  await createFirstAdmin()

  await createInitialAccessRules('admin', adminRules)
  await createInitialAccessRules('app', appRules)

  // 创建内置云函数
  await createBuiltinFunctions()

  // 部署访问策略
  await publishAccessPolicy().then(() => console.log('policy deployed'))

  // 部署云函数
  await publishFunctions().then(() => console.log('functions deployed'))

  sys_accessor.close()
  app_accessor.close()
}

main()


// 创建初始管理员
async function createFirstAdmin() {
  try {
    const username = Config.SYS_ADMIN
    const password = hashPassword(Config.SYS_ADMIN_PASSWORD)

    const { total } = await db.collection('__admins').count()
    if (total > 0) {
      console.log('admin already exists')
      return
    }

    await sys_accessor.db.collection('__admins').createIndex('username', { unique: true })

    const { data } = await db.collection('__roles').get()
    const roles = data.map(it => it.name)

    const r_add = await db.collection('__admins').add({
      username,
      avatar: "https://static.dingtalk.com/media/lALPDe7szaMXyv3NAr3NApw_668_701.png",
      name: 'Admin',
      roles,
      created_at: Date.now(),
      updated_at: Date.now()
    })
    assert(r_add.ok, 'add admin occurs error')

    await db.collection('__password').add({
      uid: r_add.id,
      password,
      type: 'login',
      created_at: Date.now(),
      updated_at: Date.now()
    })

    return r_add.id
  } catch (error) {
    console.error(error.message)
  }
}

// 创建初始角色
async function createFirstRole() {
  try {

    await sys_accessor.db.collection('__roles').createIndex('name', { unique: true })

    const r_perm = await db.collection('__permissions').get()
    assert(r_perm.ok, 'get permissions failed')

    const permissions = r_perm.data.map(it => it.name)

    const r_add = await db.collection('__roles').add({
      name: 'superadmin',
      label: '超级管理员',
      description: '系统初始化的超级管理员',
      permissions,
      created_at: Date.now(),
      updated_at: Date.now()
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

  // 创建唯一索引
  await sys_accessor.db.collection('__permissions').createIndex('name', { unique: true })

  for (const perm of permissions) {
    try {
      const data = {
        ...perm,
        created_at: Date.now(),
        updated_at: Date.now()
      }
      await db.collection('__permissions').add(data)
      console.log('permissions added: ' + perm.name)

    } catch (error) {
      if (error.code == 11000) {
        console.log('permissions already exists: ' + perm.name)
        continue
      }
      console.error(error.message)
    }
  }

  return true
}

// 创建初始访问规则
async function createInitialAccessRules(category, rules) {

  for (const collection in rules) {
    const { total } = await db.collection('__rules')
      .where({ category, collection })
      .count()

    if (total) {
      console.log(`rule already exists : ${category}.${collection}`)
      continue
    }

    await db.collection('__rules').add({
      category,
      collection,
      data: JSON.stringify(rules[collection]),
      created_at: Date.now(),
      updated_at: Date.now()
    })

    console.log(`added rule: ${category}.${collection}`)
  }
}

// 创建内置云函数
async function createBuiltinFunctions() {
  // 创建云函数索引
  await sys_accessor.db.collection('__functions').createIndex('name', { unique: true })
  await sys_accessor.db.collection('__function_logs').createIndex('requestId')
  await sys_accessor.db.collection('__function_logs').createIndex('func_id')
  

  const loader = new FunctionLoader()
  const funcs = await loader.getFunctions()
  for (const func of funcs) {
    try {
      const data = {
        ...func,
        status: 1,
        tags: ['内置'],
        created_at: Date.now(),
        updated_at: Date.now()
      }
      await db.collection('__functions').add(data)
    } catch (error) {
      if (error.code == 11000) {
        console.log('functions already exists: ' + func.name)
        continue
      }
      console.error(error.message)
    }
  }

  return true
}