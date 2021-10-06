/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 19:21:13
 * @Description: 
 */
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"


/**
 * Add function execution log
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: any): Promise<any> {
  const db = DatabaseAgent.db

  if (!data) return null
  const r = await db.collection(Constants.function_log_collection)
    .insertOne(data)

  return r.insertedId
}