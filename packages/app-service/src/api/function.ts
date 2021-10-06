/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 19:25:59
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"
import { ObjectId } from 'mongodb'

/**
 * Gets the cloud function by function name
 * @param func_name 
 * @returns 
 */
export async function getFunctionByName(func_name: string) {
  const db = DatabaseAgent.db

  const doc = await db.collection(Constants.function_collection)
    .findOne({ name: func_name })

  return doc as any
}

/**
  * Get the cloud function by function id
  * @param func_name 
  * @returns 
  */
export async function getFunctionById(func_id: string) {
  const db = DatabaseAgent.db

  const doc = await db.collection(Constants.function_collection)
    .findOne({
      _id: new ObjectId(func_id)
    })

  return doc as any
}