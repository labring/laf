import * as assert from 'assert'
import { Constants } from '../constants'
import { Globals } from "../lib/globals"
import { ObjectId } from 'mongodb'

const db = Globals.sys_db
export interface RuleDocument {
  category: string,
  collection: string,
  data: Object
}

/**
 * 根据类别获取策略规则
 * @param category 策略类别
 * @returns 
 */
export async function getAccessPolicy(category: string): Promise<any> {
  const r = await db.collection('__rules')
    .where({ category })
    .get()

  assert.ok(r.ok && r.data.length, `read rules failed: ${category}`)

  const rules = r.data

  const ruleMap = {}
  for (const rule of rules) {
    const key = rule['collection']
    ruleMap[key] = JSON.parse(rule['data'])
  }

  return ruleMap
}

/**
 * 发布访问策略
 * 实为将 sys_db.__rules 中的表，复制其数据至 app_db 中
 */
export async function publishAccessPolicy() {
  const logger = Globals.logger

  const app_accessor = Globals.app_accessor
  const ret = await Globals.sys_accessor.db.collection('__policies').find().toArray()
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.policy_collection)
      await app_coll.deleteMany({})
      await app_coll.insertMany(ret)
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}


/**
  * 部署访问策略
  * 应用远程推送过来的部署请求
  */
export async function deployPolicies(policies) {
  assert.ok(policies)
  assert.ok(policies instanceof Array)
  const logger = Globals.logger

  const accessor = Globals.sys_accessor

  const data = policies
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const item of data) {
        await _deployOnePolicy(item)
      }
    })
  } catch (error) {
    logger.error(error)
    throw error
  } finally {
    await session.endSession()
  }
}

async function _deployOnePolicy(policy: any) {

  await _deletePolicyWithSameNameButNotId(policy)

  const db = Globals.sys_accessor.db
  const r = await db.collection('__policies').findOne({ _id: new ObjectId(policy._id) })

  const data = {
    ...policy
  }


  // if exists
  if (r) {
    delete data['_id']
    const ret = await db.collection('__policies').updateOne({ _id: r._id }, {
      $set: data
    })

    assert(ret.matchedCount, `deploy: update policy ${policy.name} occurred error`)
    return
  }

  // if new
  const ret = await db.collection('__policies').insertOne(data as any)
  assert(ret.insertedId, `deploy: add policy ${policy.name} occurred error`)
}

/**
 * 删除本地 _id 不同，但 name 相同的策略（若存在）
 * @param func 
 */
async function _deletePolicyWithSameNameButNotId(policy: any) {
  const db = Globals.sys_accessor.db
  await db.collection('__policies').findOneAndDelete({
    _id: {
      $ne: new ObjectId(policy._id)
    },
    name: policy.name
  })
}