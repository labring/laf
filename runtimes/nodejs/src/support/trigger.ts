/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 19:21:35
 * @Description: 
 */

import { Trigger } from "./function-engine"
import { Constants } from "../constants"
import { DatabaseAgent } from "../db"

/**
 * Get triggers
 * @param status The default value is 1, means will select all enabled triggers
 * @returns 
 */
export async function getTriggers(status = 1) {
  const db = DatabaseAgent.db

  const docs = await db.collection(Constants.function_collection)
    .find({
      triggers: { $exists: true },
      'triggers.status': status
    }, {
      projection: { triggers: 1 }
    })
    .toArray()

  const triggers = []
  for (const func of docs) {
    func.triggers.forEach((tri: any) => tri['func_id'] = func._id.toString())
    triggers.push(...func.triggers)
  }

  return triggers.map(data => Trigger.fromJson(data))
}