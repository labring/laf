#! /usr/bin/env node

const Config = require('../dist/config').default
const { hashPassword } = require('../dist/lib/utils/hash')
const assert = require('assert')
const { FunctionLoader } = require('./func-loader')
const { Constants } = require('../dist/constants')
const { DatabaseAgent } = require('../dist/lib/db-agent')
const appAdminRules = require('./policies/app-admin.json')
const appUserRules = require('./policies/app-user.json')


const sys_accessor = DatabaseAgent.sys_accessor

const db = DatabaseAgent.sys_db

async function main() {
  await sys_accessor.ready

  // create first admin
  await createFirstAdmin()

  await createInitialPolicy('admin', appAdminRules, 'injector-admin')
  await createInitialPolicy('app', appUserRules)

  // create built-in functions
  await createBuiltinFunctions()

  sys_accessor.close()
}

main()


/**
 * Create the first admin
 * @returns 
 */
async function createFirstAdmin() {
  try {
    const username = Config.SYS_ADMIN || 'root'
    const password = hashPassword(Config.SYS_ADMIN_PASSWORD || 'kissme')

    const { total } = await db.collection(Constants.cn.accounts).count()
    if (total > 0) {
      console.log('admin already exists')
      return
    }

    await sys_accessor.db.collection(Constants.cn.accounts).createIndex('username', { unique: true })

    const roles = Object.keys(Constants.roles)

    const r_add = await db.collection(Constants.cn.accounts).add({
      username,
      avatar: "https://static.dingtalk.com/media/lALPDe7szaMXyv3NAr3NApw_668_701.png",
      name: 'InitAccount',
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