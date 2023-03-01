import { FUNCTION_LOG_COLLECTION } from '../constants'
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

  const collection = db.collection<IFunctionLog>(FUNCTION_LOG_COLLECTION)
  const doc = {
    request_id: ctx.requestId,
    func: ctx.__function_name,
    data: message,
    created_at: new Date(),
  }

  await collection.insertOne(doc)
}
