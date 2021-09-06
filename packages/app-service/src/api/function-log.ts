/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:51:13
 * @Description: 
 */
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"

const db = DatabaseAgent.db

/**
 * Add function execution log
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: any) {
  if (!data) return null

  const r = await db.collection(Constants.function_log_collection)
    .add(data)

  return r.id
}