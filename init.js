#! /usr/bin/env node

const { db, accessor } = require('./dist/lib/db')
const { hash } = require('./dist/lib/token')
const Config = require('./dist/config').default
const assert = require('assert')

// 初始化第一个超级管理员
async function initFristAdmin() {
  try {
    const username = Config.SUPER_ADMIN
    const password = hash(Config.SUPER_ADMIN_PASSWORD)

    const r_count = await db.collection('admin').count()
    assert(r_count.ok, 'query admin occurs error:' + r_count.error)
    assert(r_count.total == 0, 'already exists admin')

    const r_add = await db.collection('base_user').add({ password })
    assert(r_add.ok, 'add base_user occurs error')

    const r_add_admin = await db.collection('admin').add({ uid: r_add.id, username })
    assert(r_add_admin.ok, 'add admin occurs error')

    return true
  } catch (error) {
    console.log(error.toString())
    return false
  }
}

async function main() {
  if (await initFristAdmin()) {
    console.log('INIT FIRST ADMIN: SUCCESSED!')
  }

  accessor.close()
}

main()