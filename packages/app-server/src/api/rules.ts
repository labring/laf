import * as assert from 'assert'
import { Constants } from '../constants'
import { Globals } from "../lib/globals/index"
import { PolicyAgentInstance } from '../lib/policy-agent'

const db = Globals.db

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
