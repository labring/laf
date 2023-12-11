import { AxiosStatic } from 'axios'
import * as mongodb from 'mongodb'
import { Db } from 'database-proxy'
import { WebSocket } from 'ws'
import { FunctionContext } from './function.interface'
import { CloudStorage } from './storage'

export type InvokeFunctionType = (
  name: string,
  param?: FunctionContext
) => Promise<any>
export type GetTokenFunctionType = (payload: any, secret?: string) => string
export type ParseTokenFunctionType = (
  token: string,
  secret?: string
) => any | null

export interface MongoDriverObject {
  client: mongodb.MongoClient
  db: mongodb.Db
}

export interface CloudSdkInterface {
  /**
   * Sending an HTTP request is actually an Axios instance. You can refer to the Axios documentation directly.
   * @deprecated this is deprecated and will be removed in future, use the global `fetch()` directly @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
   * @see https://axios-http.com/docs/intro
   */
  fetch?: AxiosStatic

  /**
   * Get a database-ql instance
   * @deprecated use `mongo.db` instead
   */
  database(): Db

  /**
   * Invoke cloud function
   * @deprecated Just import the cloud function directly, and then call it
   */
  invoke: InvokeFunctionType

  /**
   * Cloud function global memory `shared` object, which can share data across multiple requests and different cloud functions
   * 1. Some global configurations can be initialized into `shared`, such as 3rd-party API configuration
   * 2. You can share some common methods, such as checkPermission(), to improve the performance of cloud functions
   * 3. It can cache hot data and is recommended to use it in a small amount (this object is allocated in the node VM heap because of the memory limit of the node VM heap)
   * @deprecated this is deprecated and will be removed in future
   */
  shared: Map<string, any>

  /**
   * Generate a JWT Token, if don't provide `secret` fields, use current server secret key to do signature
   */
  getToken: GetTokenFunctionType

  /**
   * Parse a JWT Token, if don't provide `secret` fields, use current server secret key to verify signature
   */
  parseToken: ParseTokenFunctionType

  /**
   * The mongodb instance of MongoDB node.js native driver.
   * @see https://www.mongodb.com/docs/drivers/node/current/quick-reference/
   *
   * #### Transaction operations
   * ```js
   *  const session = mongo.client.startSession()
   *  try {
   *       await session.withTransaction(async () => {
   *          await mongo.db.collection('xxx').updateOne({}, { session })
   *          await mongo.db.collection('yyy').deleteMany({}, { session })
   *       })
   *  } finally {
   *       await session.endSession()
   *  }
   * ```
   * #### Indexes operations
   * ```js
   *    await mongo.db.collection('users').createIndex('username', { unique: true })
   * ```
   * #### Aggregation operations
   * ```js
   *    await mongo.db.collection('users')
   *      .aggregate([])
   *      .toArray()
   * ```
   */
  mongo: MongoDriverObject

  /**
   * Websocket connection list
   */
  sockets: Set<WebSocket>

  /**
   * Current app id
   */
  appid: string

  /**
   * @deprecated this is deprecated and will be removed in future, use `process.env` instead
   */
  env: any

  /**
   * Cloud storage instance
   */
  storage: CloudStorage
}
