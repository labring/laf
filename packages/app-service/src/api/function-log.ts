/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-05 12:06:42
 * @Description: 
 */
import { ObjectId } from "bson"
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/database"


export interface CloudFunctionLogStruct {
  requestId: string
  method: string
  func_id: ObjectId
  func_name: string
  logs: string[]
  time_usage: number
  data: any
  error: Error
  debug?: boolean
  created_at?: Date
  created_by?: any
}

/**
 * Add function execution log
 * @param data 
 * @returns 
 */
export async function addFunctionLog(data: CloudFunctionLogStruct): Promise<any> {
  const db = DatabaseAgent.db

  if (!data) return null
  const r = await db.collection(Constants.function_log_collection)
    .insertOne({
      ...data,
      created_at: new Date()
    })

  return r.insertedId
}