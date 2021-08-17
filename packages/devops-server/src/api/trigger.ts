/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 16:58:09
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { ClientSession, ObjectId } from 'mongodb'
import * as assert from 'assert'
import { logger } from "../lib/logger"

const db = DatabaseAgent.sys_db

/**
 * load triggers
 * @param status the status of trigger, default is 1 means enabled
 * @returns 
 */
export async function getTriggers(status = 1) {
  const r = await db.collection(Constants.cn.triggers)
    .where({ status: status })
    .get()

  return r.data
}

/**
 * load trigger by its id
 * @param id 
 * @returns 
 */
export async function getTriggerById(id: string) {
  const r = await db.collection(Constants.cn.triggers)
    .where({ _id: id })
    .getOne()

  return r.data
}


/**
  * Publish triggers
  * Means that copying sys db functions to app db
  */
export async function publishTriggers() {
  // read triggers from sys db
  const ret = await DatabaseAgent.sys_accessor.db.collection(Constants.cn.triggers).find().toArray()

  // write triggers to app db
  const app_accessor = DatabaseAgent.app_accessor
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.trigger_collection)
      await app_coll.deleteMany({}, { session })
      await app_coll.insertMany(ret, { session })
    })
  } finally {
    await session.endSession()
  }
}


/**
  * Deploy triggers which pushed from remote environment
  */
export async function deployTriggers(triggers: any[]) {
  assert.ok(triggers)
  assert.ok(triggers instanceof Array)

  const accessor = DatabaseAgent.sys_accessor

  const data = triggers
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const func of data) {
        await _deployOneTrigger(func, session)
      }
    })
  } finally {
    await session.endSession()
  }
}


/**
 * Deploy a trigger used by `deployTriggers`.
 * @param trigger the trigger data to be deployed
 * @param session the mongodb session for transaction operations
 * @see deployTriggers
 * @private
 * @returns 
 */
async function _deployOneTrigger(trigger: any, session: ClientSession) {
  const db = DatabaseAgent.sys_accessor.db

  // skip trigger with invalid func_id
  const func = await db.collection(Constants.cn.functions).findOne({ _id: new ObjectId(trigger.func_id) })
  if (!func) {
    logger.warn(`skip trigger with invalid func_id: ${trigger.func_id}`, trigger)
    return
  }

  const r = await db.collection(Constants.cn.triggers).findOne({ _id: new ObjectId(trigger._id) }, { session })

  const data = {
    ...trigger
  }

  logger.debug('deploy trigger: ', data, r)

  // if exists trigger
  if (r) {
    delete data['_id']
    const ret = await db.collection(Constants.cn.triggers).updateOne({ _id: r._id }, {
      $set: data
    }, { session })

    assert(ret.matchedCount, `deploy: update trigger ${trigger.name} occurred error`)
    return
  }

  // if new trigger
  data._id = new ObjectId(data._id) as any
  const ret = await db.collection(Constants.cn.triggers).insertOne(data as any, { session })
  assert(ret.insertedId, `deploy: add trigger ${trigger.name} occurred error`)
}