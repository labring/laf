/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-06 14:24:22
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { ApplicationStruct, getApplicationDbAccessor } from "./application"


/**
 * load triggers
 * @param appid 
 * @returns 
 */
export async function getTriggers(appid: string) {
  const db = DatabaseAgent.sys_accessor.db

  const funcs = await db.collection(Constants.cn.functions)
    .find(
      { appid },
      {
        projection: { _id: 1, triggers: 1 }
      })
    .toArray()

  const rets = []
  for (const func of funcs) {
    if (func.triggers?.length) {
      const triggers = func.triggers.map(tri => {
        tri['func_id'] = func._id.toString()
        return tri
      })
      rets.push(...triggers)
    }
  }
  return rets
}

/**
  * Publish triggers
  * Means that copying sys db functions to app db
  */
export async function publishTriggers(app: ApplicationStruct) {
  // read triggers from sys db
  const ret = await getTriggers(app.appid)

  // write triggers to app db
  const app_accessor = await getApplicationDbAccessor(app)
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