import Config from '../config'
import { FUNCTION_LOG_COLLECTION } from '../constants'
import { DatabaseAgent } from '../db'
import { FunctionConsole, FunctionContext } from './function-engine'

export interface IFunctionLog {
  request_id: string
  func: string
  data: string
  created_at: Date
}

FunctionConsole.write = (message: string, ctx: FunctionContext) => {
  const db = DatabaseAgent.db
  if (!db) return

  const doc = {
    request_id: ctx.requestId,
    func: ctx.__function_name,
    data: message,
    created_at: new Date(),
  }

  db.collection<IFunctionLog>(FUNCTION_LOG_COLLECTION).insertOne(doc)
}


/**
 * Create necessary indexes of collections
 * @param data
 * @returns
 */
export async function ensureCollectionIndexes(): Promise<any> {
  const db = DatabaseAgent.db
  await db.collection(FUNCTION_LOG_COLLECTION).createIndexes([
    {
      key: { created_at: 1 },
      expireAfterSeconds: Config.FUNCTION_LOG_EXPIRED_TIME,
    },
  ])

  return true
}
