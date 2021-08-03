#! /usr/bin/env node

const Config = require('../dist/config').default
const { hashPassword } = require('../dist/lib/utils/hash')
const assert = require('assert')
const { permissions } = require('./sys-permissions')
const { FunctionLoader } = require('./func-loader')
const { Constants } = require('../dist/constants')
const { Globals } = require('../dist/lib/globals')
const { publishFunctions } = require('../dist/api/function')
const { publishAccessPolicy } = require('../dist/api/rules')
const { publishTriggers } = require('../dist/api/trigger')
const appAdminRules = require('./policies/app-admin.json')
const appUserRules = require('./policies/app-user.json')


const sys_accessor = Globals.sys_accessor

const db = Globals.sys_db

const app_accessor = Globals.app_accessor

async function main() {
  await sys_accessor.ready
  await app_accessor.ready

  // 创建 RBAC 初始权限
  await createInitialPermissions()

  // 创建 RBAC 初始角色
  await createFirstRole()

  // 创建初始管理员
  await createFirstAdmin()

  await createInitialPolicy('admin', appAdminRules)
  await createInitialPolicy('app', appUserRules)

  // 创建内置云函数
  await createBuiltinFunctions()

  // 部署访问策略
  await publishAccessPolicy().then(() => console.log('policy deployed'))

  // 部署云函数
  await publishFunctions().then(() => console.log('functions deployed'))

  // 部署触发器
  await publishTriggers().then(() => console.log('triggers deployed'))

  sys_accessor.close()
  app_accessor.close()
}

main()


/**
 * 创建初始管理员
 * @returns 
 */
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

/**
 * 创建初始角色
 * @returns 
 */
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

/**
 * 创建初始权限
 * @returns 
 */
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

/**
 * 创建策略
 * @param {string} name policy name
 * @param {string} rules policy rules
 * @param {string} injector cloud function id
 * @returns 
 */
async function createInitialPolicy(name, rules, injector) {

  // if policy existed, skip it
  const { total } = await db.collection('__policies')
      .where({ name: name })
      .count()

  if (total) {
    console.log(`rule already exists : ${name}`)
    return
  }

  await sys_accessor.db.collection('__policies').createIndex('name', { unique: true })

  // add policy
  await db.collection('__policies').add({
    name: name,
    rules: rules,
    status: 1,
    injector: injector,
    created_at: Date.now(),
    updated_at: Date.now()
  })

  console.log(`added policy: ${name}`)
}

/**
 * 创建内置云函数
 * @returns 
 */
async function createBuiltinFunctions() {
  // 创建云函数索引
  await sys_accessor.db.collection('__functions').createIndex('name', { unique: true })
  

  const loader = new FunctionLoader()
  const funcs = await loader.getFunctions()
  for (const func of funcs) {
    try {
      const triggers = func.triggers || []
      const data = {
        ...func,
        status: 1,
        created_at: Date.now(),
        updated_at: Date.now()
      }
      delete data['triggers']
      const r = await db.collection('__functions').add(data)

      if (triggers.length) {
        await createTriggers(r.id, triggers)
      }
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

/**
 * 创建触发器
 */
async function createTriggers(func_id, triggers) {
  assert.ok(func_id, 'invalid func_id')
  assert.ok(triggers.length, 'no triggers found')

  for (const tri of triggers) {
    const data = {
      ...tri,
      created_at: Date.now(),
      updated_at: Date.now(),
      func_id: func_id
    }
    await db.collection('__triggers').add(data)
  }

  console.log(`triggers of func[${func_id}] created`)
}