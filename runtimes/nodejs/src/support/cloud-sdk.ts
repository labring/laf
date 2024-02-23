import { CloudSdkInterface, Cloud } from '@lafjs/cloud'
import { getDb } from 'database-proxy'
import { DatabaseAgent } from '../db'
import { getToken, parseToken } from './token'
import { WebSocketAgent } from './ws'
import Config from '../config'
import { FunctionContext } from './engine'
import { FunctionModule } from './engine/module'

if (!Cloud.create) {
  Cloud.create = createCloudSdk
}

/**
 * object shared cross all functions & requests
 */
const _shared_preference = new Map<string, any>()

/**
 * Create a new Cloud SDK instance
 *
 * @returns
 */
export function createCloudSdk() {
  const cloud: CloudSdkInterface = {
    database: () => getDb(DatabaseAgent.accessor),
    invoke: invokeInFunction,
    shared: _shared_preference,
    getToken: getToken,
    parseToken: parseToken,
    mongo: {
      client: DatabaseAgent.client as any,
      db: DatabaseAgent.db as any,
    },
    sockets: WebSocketAgent.clients,
    appid: Config.APPID,
    get env() {
      return process.env
    },
    storage: null,
  }

  /**
   * Ensure the database is connected, update its Mongo object, otherwise it is null
   */
  DatabaseAgent.ready.then(() => {
    cloud.mongo.client = DatabaseAgent.client as any
    cloud.mongo.db = DatabaseAgent.accessor.db as any
  })
  return cloud
}

/**
 * The cloud function is invoked in the cloud function, which runs in the cloud function.
 *
 * @param name the name of cloud function to be invoked
 * @ctx ctx the invoke params
 * @returns
 */
async function invokeInFunction(name: string, ctx?: FunctionContext) {
  const mod = FunctionModule.get(name)
  const func = mod?.default || mod?.main

  if (!func) {
    throw new Error(`invoke() failed to get function: ${name}`)
  }

  ctx = ctx ?? ({} as any)
  ctx.__function_name = name

  ctx.requestId = ctx.requestId ?? 'invoke'

  ctx.method = ctx.method ?? 'call'

  return await func(ctx)
}
