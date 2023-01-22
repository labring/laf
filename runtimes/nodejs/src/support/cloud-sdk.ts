import { CloudSdkInterface, Cloud } from '@lafjs/cloud'
import { getDb } from 'database-proxy'
import { CloudFunction, FunctionContext } from './function-engine'
import { DatabaseAgent } from '../db'
import { getToken, parseToken } from './token'
import { WebSocketAgent } from './ws'
import Config from '../config'

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
    appid: Config.APP_ID,
    env: {
      DB_URI: Config.DB_URI,
      SERVER_SECRET: Config.SERVER_SECRET,
      APP_ID: process.env.APP_ID,
      OSS_ACCESS_KEY: process.env.APP_ID,
      OSS_ACCESS_SECRET: process.env.OSS_ACCESS_SECRET,
      OSS_REGION: process.env.OSS_REGION,
      OSS_INTERNAL_ENDPOINT: process.env.OSS_INTERNAL_ENDPOINT,
      OSS_EXTERNAL_ENDPOINT: process.env.OSS_EXTERNAL_ENDPOINT,
      NPM_INSTALL_FLAGS: process.env.NPM_INSTALL_FLAGS || '',
      RUNTIME_IMAGE: Config.RUNTIME_IMAGE,
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
  const data = await CloudFunction.getFunctionByName(name)
  const func = new CloudFunction(data)

  if (!func) {
    throw new Error(`invoke() failed to get function: ${name}`)
  }

  param = param ?? ({} as any)
  param.__function_name = name

  param.requestId = param.requestId ?? 'invoke'

  param.method = param.method ?? 'call'

  const result = await func.invoke(param)

  if (result.error) {
    throw result.error
  }

  return result.data
}
