#! /usr/bin/env node

const Config = require('../dist/config').default
const { hashPassword } = require('../dist/lib/utils/hash')
const assert = require('assert')
const { permissions } = require('./sys-permissions')
const { FunctionLoader } = require('./func-loader')
const { Constants } = require('../dist/constants')
const { DatabaseAgent } = require('../dist/lib/db-agent')
const { publishFunctions } = require('../dist/api/function')
const { publishAccessPolicy } = require('../dist/api/rules')
const { publishTriggers } = require('../dist/api/trigger')
const appAdminRules = require('./policies/app-admin.json')
const appUserRules = require('./policies/app-user.json')


const sys_accessor = DatabaseAgent.sys_accessor

const db = DatabaseAgent.sys_db

const app_accessor = DatabaseAgent.app_accessor

async function main() {
  await sys_accessor.ready
  await app_accessor.ready

  // init permission
  await createInitialPermissions()

  // init first role
  await createFirstRole()

  // create first admin
  await createFirstAdmin()

  await createInitialPolicy('admin', appAdminRules, 'injector-admin')
  await createInitialPolicy('app', appUserRules)

  // create built-in functions
  await createBuiltinFunctions()

  // publish policies
  await publishAccessPolicy().then(() => console.log('policy deployed'))

  // publish functions
  await publishFunctions().then(() => console.log('functions deployed'))

  // publish triggers
  await publishTriggers().then(() => console.log('triggers deployed'))

  sys_accessor.close()
  app_accessor.close()
}

main()


/**
 * Create the first admin
 * @returns 
 */
async function createFirstAdmin() {
  try {
    const username = Config.SYS_ADMIN
    const password = hashPassword(Config.SYS_ADMIN_PASSWORD)

    const { total } = await db.collection(Constants.cn.admins).count()
    if (total > 0) {
      console.log('admin already exists')
      return
    }

    await sys_accessor.db.collection(Constants.cn.admins).createIndex('username', { unique: true })

    const { data } = await db.collection(Constants.cn.roles).get()
    const roles = data.map(it => it.name)

    const r_add = await db.collection(Constants.cn.admins).add({
      username,
      avatar: "https://static.dingtalk.com/media/lALPDe7szaMXyv3NAr3NApw_668_701.png",
      name: 'Admin',
      roles,
      created_at: Date.now(),
      updated_at: Date.now()
    })
    assert(r_add.ok, 'add admin occurs error')

    await db.collection(Constants.cn.password).add({
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
 * Create the first role
 * @returns 
 */
async function createFirstRole() {
  try {

    await sys_accessor.db.collection(Constants.cn.roles).createIndex('name', { unique: true })

    const r_perm = await db.collection(Constants.cn.permissions).get()
    assert(r_perm.ok, 'get permissions failed')

    const permissions = r_perm.data.map(it => it.name)

    const r_add = await db.collection(Constants.cn.roles).add({
      name: 'superadmin',
      label: 'Super Admin',
      description: 'init role',
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
 * Create initial permissions
 * @returns 
 */
async function createInitialPermissions() {

  // create unique index in permission collection
  await sys_accessor.db.collection(Constants.cn.permissions).createIndex('name', { unique: true })

  for (const perm of permissions) {
    try {
      const data = {
        ...perm,
        created_at: Date.now(),
        updated_at: Date.now()
      }
      await db.collection(Constants.cn.permissions).add(data)
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
 * Create initial policies
 * @param {string} name policy name
 * @param {string} rules policy rules
 * @param {string} injector cloud function id
 * @returns 
 */
async function createInitialPolicy(name, rules, injector) {

  // if policy existed, skip it
  const { total } = await db.collection(Constants.cn.policies)
      .where({ name: name })
      .count()

  if (total) {
    console.log(`rule already exists : ${name}`)
    return
  }

  await sys_accessor.db.collection(Constants.cn.policies).createIndex('name', { unique: true })

  // add policy
  await db.collection(Constants.cn.policies).add({
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
 * Create built-in functions
 * @returns 
 */
async function createBuiltinFunctions() {
  // create unique index in function collection
  await sys_accessor.db.collection(Constants.cn.functions).createIndex('name', { unique: true })
  
  const loader = new FunctionLoader()
  const funcs = await loader.getFunctions()
  for (const func of funcs) {
    try {
      const triggers = func.triggers || []
      const data = {
        ...func,
        created_at: Date.now(),
        updated_at: Date.now()
      }
      delete data['triggers']
      const r = await db.collection(Constants.cn.functions).add(data)

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
 * Create built-in triggers
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
    await db.collection(Constants.cn.triggers).add(data)
  }

  console.log(`triggers of func[${func_id}] created`)
}