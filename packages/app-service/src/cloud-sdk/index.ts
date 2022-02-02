import { AxiosStatic } from "axios"
import { Db, getDb } from "database-proxy"
import { FunctionContext } from "cloud-function-engine"
import * as mongodb from "mongodb"
import { DatabaseAgent } from "../lib/database"
import request from 'axios'
import { SchedulerInstance } from "../lib/scheduler"
import { getToken, parseToken } from "../lib/utils/token"
import { invokeInFunction } from "./invoke"
import { CloudFunction } from "../lib/function"
import { WebSocket } from "ws"
import { WebSocketAgent } from "../lib/ws"
import Config from "../config"


export type InvokeFunctionType = (name: string, param: FunctionContext) => Promise<any>
export type EmitFunctionType = (event: string, param: any) => void
export type GetTokenFunctionType = (payload: any, secret?: string) => string
export type ParseTokenFunctionType = (token: string, secret?: string) => any | null

export interface MongoDriverObject {
  client: mongodb.MongoClient
  db: mongodb.Db
}

export interface CloudSdkInterface {
  /**
   * Sending an HTTP request is actually an Axios instance. You can refer to the Axios documentation directly
   */
  fetch: AxiosStatic

  /**
   * Get a laf.js database-ql instance
   */
  database(): Db,

  /**
   * Invoke cloud function 
   */
  invoke: InvokeFunctionType

  /**
   * Emit a cloud function event that other cloud functions can set triggers to listen for
   */
  emit: EmitFunctionType

  /**
   * Cloud function global memory `shared` object, which can share data across multiple requests and different cloud functions
   * 1. Some global configurations can be initialized into `shared`, such as 3rd-party API configuration
   * 2. You can share some common methods, such as checkPermission(), to improve the performance of cloud functions
   * 3. It can cache hot data and is recommended to use it in a small amount (this object is allocated in the node VM heap because of the memory limit of the node VM heap)
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
   * 
   * Because the laf.js database-QL has only partial data manipulation capability, 
   * expose this `mongo` object to the cloud function, so that the cloud function has full database manipulation capability:
   * 1. Transaction operations
   * ```js
   *  const session = mongo.client.startSession()
   *  try {
   *       await session.withTransaction(async () => {
   *       await mongo.db.collection('xxx').updateOne({}, { session })
   *       await mongo.db.collection('yyy').deleteMany({}, { session })
   *  } finally {
   *       await session.endSession()
   *  }
   * ```
   * 2. Indexes operations
   * ```js
   *    await mongo.db.collection('users').createIndex('username', { unique: true })
   * ```
   * 3. Aggregation operations
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
}


/**
 * Cloud SDK instance
 */
const cloud: CloudSdkInterface = create()

/**
 * After the database connection is successful, update its Mongo object, otherwise it is null
 */
DatabaseAgent.accessor.ready.then(() => {
  cloud.mongo.client = DatabaseAgent.accessor.conn
  cloud.mongo.db = DatabaseAgent.accessor.db
})

/**
 * Create a new Cloud SDK instance
 * 
 * @returns 
 */
export function create() {
  const cloud: CloudSdkInterface = {
    database: () => getDb(DatabaseAgent.accessor),
    fetch: request,
    invoke: invokeInFunction,
    emit: (event: string, param: any) => SchedulerInstance.emit(event, param),
    shared: CloudFunction._shared_preference,
    getToken: getToken,
    parseToken: parseToken,
    mongo: {
      client: DatabaseAgent.accessor.conn,
      db: DatabaseAgent.accessor.db
    },
    sockets: WebSocketAgent.clients,
    appid: Config.APP_ID
  }
  return cloud
}

export default cloud