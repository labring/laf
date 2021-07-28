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
  const r = await db.collection('__rules').get()
  assert.ok(r.ok, `deploy policy: read rules failed`)

  const app_coll = Globals.app_db.collection(Constants.policy_collection)

  // 先清除原数据
  const cleared = await app_coll.remove({multi: true})
  assert(cleared.ok, `clear ${Constants.policy_collection} failed`)

  // 写入数据
  const copied = await app_coll.add(r.data, { multi: true})
  assert(copied.id, `write ${Constants.policy_collection} failed`)

  return copied
}