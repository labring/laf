import { CloudSdkInterface, Cloud } from '@lafjs/cloud'
import { getDb } from 'database-proxy'
import { DatabaseAgent } from '../db'
import { getToken, parseToken } from './token'
import { WebSocketAgent } from './ws'
import Config from '../config'
import { CloudFunction, FunctionCache, FunctionContext } from './engine'

Cloud.create = createCloudSdk

/**
 * Create a new Cloud SDK instance
 *
 * @returns
 */
function createCloudSdk() {
  const cloud: CloudSdkInterface = {
    database: () => getDb(DatabaseAgent.accessor),
    invoke: invokeInFunction,
    shared: CloudFunction._shared_preference,
    getToken: getToken,
    parseToken: parseToken,
    mongo: {
      client: DatabaseAgent.accessor.conn,
      db: DatabaseAgent.accessor.db,
    },
    sockets: WebSocketAgent.clients,
    appid: Config.APPID,
    get env() {
      return {
        ...process.env,
      }
    },
  }

  /**
   * Ensure the database is connected, update its Mongo object, otherwise it is null
   */
  DatabaseAgent.accessor.ready.then(() => {
    cloud.mongo.client = DatabaseAgent.accessor.conn
    cloud.mongo.db = DatabaseAgent.accessor.db
  })
  return cloud
}

/**
 * The cloud function is invoked in the cloud function, which runs in the cloud function.
 *
 * @param name the name of cloud function to be invoked
 * @param param the invoke params
 * @returns
 */
async function invokeInFunction(name: string, param?: FunctionContext) {
  const func = FunctionCache.getEngine(name)

  if (!func) {
    throw new Error(`invoke() failed to get function: ${name}`)
  }

  param = param ?? ({} as any)
  param.__function_name = name

  param.requestId = param.requestId ?? 'invoke'

  param.method = param.method ?? 'call'

  const result = await func.execute(param)

  if (result.error) {
    throw result.error
  }

  return result.data
}
