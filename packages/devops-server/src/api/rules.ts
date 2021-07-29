import * as assert from 'assert'
import { Constants } from '../constants'
import { Globals } from "../lib/globals"

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
 * 部署访问策略
 * 实为将 sys_db.__rules 中的表，复制其数据至 app_db 中
 */
export async function deployAccessPolicy() {
  const logger = Globals.logger
 
  const app_accessor = Globals.app_accessor
  const ret = await Globals.sys_accessor.db.collection('__rules').find().toArray()
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.policy_collection);
      await app_coll.deleteMany({});
      await app_coll.insertMany(ret);
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}