/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-13 13:48:05
 * @Description: 
 */

import * as assert from 'assert'
import { Constants } from '../constants'
import { DatabaseAgent } from "../lib/db-agent"
import { ClientSession, ObjectId } from 'mongodb'
import { ApplicationStruct, getApplicationDbAccessor } from './application'
import { logger } from '../lib/logger'

export enum PolicyStatus {
  DISABLED = 0,
  ENABLED = 1
}
export interface PolicyStruct {
  _id: string
  name: string
  description: string
  status: PolicyStatus
  rules: any
  injector: string
  hash: string
  created_at: Date
  updated_at: Date
  created_by: ObjectId
  appid: string
}
/**
 * Load policy by its name
 * @param func_name 
 * @returns 
 */
export async function getPolicyByName(appid: string, policy_name: string) {
  const db = DatabaseAgent.db
  const doc = await db.collection<PolicyStruct>(Constants.cn.policies)
    .findOne({ name: policy_name, appid })

  return doc
}

/**
 * Publish access policies
 * Means that copying sys db functions to app db
 */
export async function publishAccessPolicies(app: ApplicationStruct) {
  // read policies from sys db
  const ret = await DatabaseAgent.sys_accessor.db
    .collection(Constants.cn.policies)
    .find({
      appid: app.appid
    })
    .toArray()

  if (ret.length === 0) return

  // write policies to app db
  const app_accessor = await getApplicationDbAccessor(app)
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.policy_collection)
      await app_coll.deleteMany({}, { session })
      await app_coll.insertMany(ret, { session })
    })
  } finally {
    await session.endSession()
    await app_accessor.conn.close()
  }
}


/**
  * Deploy policies which pushed from remote environment
  */
export async function deployPolicies(appid: string, policies: PolicyStruct[]) {
  assert.ok(policies)
  assert.ok(policies instanceof Array)

  const accessor = DatabaseAgent.sys_accessor

  const data = policies
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const item of data) {
        item['appid'] = appid
        await _deployOnePolicy(item, session)
      }
    })
  } finally {
    await session.endSession()
  }
}

/**
 * Deploy a policy used by `deployPolicies`.
 * @param policy the policy data to be deployed
 * @param session the mongodb session for transaction operations
 * @see deployPolicies
 * @private
 * @returns 
 */
async function _deployOnePolicy(policy: PolicyStruct, session: ClientSession) {
  const db = DatabaseAgent.sys_accessor.db
  const data = {
    ...policy
  }
  delete data['_id']

  const r = await db.collection(Constants.cn.policies)
    .updateOne({
      appid: policy.appid,
      name: policy.name
    }, {
      $set: data
    }, { session })

  if (r.matchedCount) {
    logger.debug(`deploy policy: found an exists policy (${policy.name}) & updated it, matchedCount ${r.matchedCount}`)
    return
  }

  // if new
  const ret = await db.collection(Constants.cn.policies).insertOne(data as any, { session })
  assert(ret.insertedId, `deploy policy: add policy ${policy.name} occurred error`)
  logger.debug(`deploy policy: inserted a policy (${policy.name}), insertedId ${ret.insertedId}`)
}