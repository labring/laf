/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-03 17:06:38
 * @Description: 
 */
import Config from "../config"
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"

/**
 * Add function execution log
 * @param data 
 * @returns 
 */
export async function ensureCollectionIndexes(): Promise<any> {
  const db = DatabaseAgent.db
  await db.collection(Constants.function_log_collection)
    .createIndexes([
      {
        key: { created_at: 1 },
        expireAfterSeconds: Config.FUNCTION_LOG_EXPIRED_TIME
      },
      {
        key: { requestId: 1 }
      },
      { key: { func_id: 1 } }
    ])

  return true
}