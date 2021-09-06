#! /usr/bin/env node

const { hashPassword } = require('../dist/utils/hash')
const assert = require('assert')
const { FunctionLoader } = require('./func-loader')
const { Constants } = require('../dist/constants')
const { DatabaseAgent } = require('../dist/lib/db-agent')

const sys_accessor = DatabaseAgent.sys_accessor

async function main() {
  await sys_accessor.ready

  const db = sys_accessor.db
  await sys_accessor.db.collection(Constants.cn.accounts).createIndex('username', { unique: true })
  await sys_accessor.db.collection(Constants.cn.applications).createIndex('appid', { unique: true })
  await sys_accessor.db.collection(Constants.cn.functions).createIndex({ appid: 1, name: 1}, { unique: true })
  await sys_accessor.db.collection(Constants.cn.policies).createIndex({ appid: 1, name: 1}, { unique: true })

  // create first account
  await createFirstAccount()

  sys_accessor.close()
}

main()


/**
 * Create the first admin
 * @returns 
 */
async function createFirstAccount() {
  const db = DatabaseAgent.sys_db

  try {
    const { total } = await db.collection(Constants.cn.accounts).count()
    if (total > 0) {
      console.log('account already exists')
      return
    }

    const roles = Object.keys(Constants.roles)
    const r_add = await db.collection(Constants.cn.accounts).add({
      username: process.env.INIT_ACCOUNT || 'root',
      name: 'root',
      password: hashPassword(process.env.INIT_ACCOUNT_PASSWORD || '123456'),
      created_at: Date.now(),
      updated_at: Date.now()
    })
    assert(r_add.ok, 'add account occurs error')

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
  const db = DatabaseAgent.sys_db

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
  const db = DatabaseAgent.sys_db

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
      await db.collection(Constants.cn.functions).add(data)
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