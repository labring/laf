import { Constants } from "../constants"
import { Globals } from "../lib/globals"

const db = Globals.db

/**
 * 添加函数执行日志
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: any) {
  if(!data) return null
  
  const r = await db.collection(Constants.function_log_collection)
    .add(data)

  return r.id
}