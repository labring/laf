/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 14:06:26
 * @Description: 
 */
import * as assert from 'assert'
import { Constants } from '../constants'
import { DatabaseAgent } from "../lib/database"
import { PolicyAgentInstance } from '../lib/policy-agent'

const db = DatabaseAgent.db

/**
 * 获取所有访问策略
 */
export async function getPolicyRules() {
  const r = await db.collection(Constants.policy_collection).get()
  assert.ok(r.ok)

  return r.data
}


/**
 * 应用访问规则
 */
export async function applyPolicyRules() {
  PolicyAgentInstance.clear()
  const policies = await getPolicyRules()
  for (const policy of policies) {
    await PolicyAgentInstance.set(policy.name, policy)
  }
}
