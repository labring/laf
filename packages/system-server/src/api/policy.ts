/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-02 16:34:22
 * @Description: 
 */

import * as assert from 'assert'
import { Constants } from '../constants'
import { DatabaseAgent } from "../lib/db-agent"
import { ClientSession, ObjectId } from 'mongodb'
import { ApplicationStruct, getApplicationDbAccessor } from './application'


/**
 * Publish access policies
 * Means that copying sys db functions to app db
 */
export async function publishAccessPolicy(app: ApplicationStruct) {
  // read policies from sys db
  const ret = await DatabaseAgent.sys_accessor.db
    .collection(Constants.cn.policies)
    .find({
      appid: app.appid
    })
    .toArray()

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
  }
}


/**
  * Deploy policies which pushed from remote environment
  */
export async function deployPolicies(policies: any[]) {
  assert.ok(policies)
  assert.ok(policies instanceof Array)

  const accessor = DatabaseAgent.sys_accessor

  const data = policies
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const item of data) {
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
async function _deployOnePolicy(policy: any, session: ClientSession) {

  await _deletePolicyWithSameNameButNotId(policy, session)

  const db = DatabaseAgent.sys_accessor.db
  const r = await db.collection(Constants.cn.policies).findOne({ _id: new ObjectId(policy._id) }, { session })

  const data = {
    ...policy
  }


  // if exists
  if (r) {
    delete data['_id']
    const ret = await db.collection(Constants.cn.policies).updateOne({ _id: r._id }, {
      $set: data
    }, { session })

    assert(ret.matchedCount, `deploy: update policy ${policy.name} occurred error`)
    return
  }

  // if new
  data._id = new ObjectId(data._id) as any
  const ret = await db.collection(Constants.cn.policies).insertOne(data as any, { session })
  assert(ret.insertedId, `deploy: add policy ${policy.name} occurred error`)
}

/**
 * Remove policy which have same name but different _id.
 * @param policy the policy to be processing 
 * @param session the mongodb session for transaction operations
 * @see _deployOnePolicy()
 * @private
 */
async function _deletePolicyWithSameNameButNotId(policy: any, session: ClientSession) {
  const db = DatabaseAgent.sys_accessor.db
  await db.collection(Constants.cn.policies).findOneAndDelete({
    _id: {
      $ne: new ObjectId(policy._id)
    },
    name: policy.name
  }, { session })
}