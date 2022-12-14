/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:58:33
 * @Description:
 */

import { Constants } from '../constants'
import { DatabaseAgent } from '../db'
import { FunctionConsole, FunctionContext } from './function-engine'

export interface IFunctionLog {
  request_id: string
  func: string
  data: string
  created_at: Date
}

FunctionConsole.write = async (message: string, ctx: FunctionContext) => {
  const db = DatabaseAgent.db
  if (!db) return

  const collection = db.collection<IFunctionLog>(
    Constants.function_log_collection,
  )
  const doc = {
    request_id: ctx.requestId,
    func: ctx.__function_name,
    data: message,
    created_at: new Date(),
  }

  await collection.insertOne(doc)
}
