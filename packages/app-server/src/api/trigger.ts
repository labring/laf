/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:53:53
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"

const db = DatabaseAgent.db

/**
 * Get triggers
 * @param status The default value is 1, means will select all enabled triggers
 * @returns 
 */
export async function getTriggers(status = 1) {
  const r = await db.collection(Constants.trigger_collection)
    .where({ status: status })
    .get()

  return r.data
}

/**
 * Get trigger by id
 * @param id 
 * @returns 
 */
export async function getTriggerById(id: string) {
  const r = await db.collection(Constants.trigger_collection)
    .where({ _id: id })
    .getOne()

  return r.data
}