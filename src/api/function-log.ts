import { db } from "../lib/db"


/**
 * 添加函数执行日志
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: any) {
  if(!data) return null
  
  const r = await db.collection('function_logs')
    .add(data)

  return r.id
}