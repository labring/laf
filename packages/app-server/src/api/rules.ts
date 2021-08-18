/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:52:27
 * @Description: 
 */

import * as assert from 'assert'
import { Constants } from '../constants'
import { DatabaseAgent } from "../lib/database"
import { PolicyAgentInstance } from '../lib/policy-agent'

const db = DatabaseAgent.db

/**
 * Get all access policies
 */
export async function getPolicyRules() {
  const r = await db.collection(Constants.policy_collection).get()
  assert.ok(r.ok)

  return r.data
}


/**
 * Applying access policies' rules
 */
export async function applyPolicyRules() {
  PolicyAgentInstance.clear()
  const policies = await getPolicyRules()
  for (const policy of policies) {
    await PolicyAgentInstance.set(policy.name, policy)
  }
}
