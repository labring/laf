/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-10 00:32:38
 * @Description: 
 */

import * as assert from "assert"
import { CN_FUNCTIONS } from "../constants"
import { DatabaseAgent } from "../db"


/**
 * load triggers
 * @param appid 
 * @returns 
 */
export async function getTriggers(appid: string) {
  assert.ok(appid, 'empty appid got')
  const db = DatabaseAgent.sys_accessor.db

  const funcs = await db.collection(CN_FUNCTIONS)
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
