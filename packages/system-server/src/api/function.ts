/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-13 13:47:55
 * @Description: 
 */

import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { ClientSession, ObjectId } from 'mongodb'
import * as assert from 'assert'
import { logger } from "../lib/logger"
import { ApplicationStruct, getApplicationDbAccessor } from "./application"
import { compileTs2js } from "../utils/lang"

export enum FunctionStatus {
  DISABLED = 0,
  ENABLED = 1
}

/**
 * Cloud function struct
 */
export interface CloudFunctionStruct {
  /** basic properties */
  _id: ObjectId
  name: string
  code: string
  compiledCode: string

  /** extend properties */
  description: string
  tags: string[]
  label: string
  triggers: any[]
  version: number
  hash: string
  status: FunctionStatus
  enableHTTP: boolean
  appid: string
  debugParams: string
  created_at: Date
  updated_at: Date
  created_by: any
}



/**
 * Load function data by its name
 * @param func_name 
 * @returns 
 */
export async function getFunctionByName(appid: string, func_name: string) {
  const db = DatabaseAgent.db
  const doc = await db.collection<CloudFunctionStruct>(Constants.cn.functions)
    .findOne({ name: func_name, appid })

  return doc
}

/**
 * Load function data by id
 * @param func_name 
 * @returns 
 */
export async function getFunctionById(appid: string, func_id: ObjectId) {
  const db = DatabaseAgent.db
  const doc = await db.collection<CloudFunctionStruct>(Constants.cn.functions)
    .findOne({ _id: func_id, appid })

  return doc
}


/**
  * Publish functions
  * Means that copying sys db functions to app db
  */
export async function publishFunctions(app: ApplicationStruct) {

  // read functions from sys db
  const ret = await DatabaseAgent.db
    .collection(Constants.cn.functions)
    .find({
      appid: app.appid
    })
    .toArray()

  if (ret.length === 0) return

  // compile functions
  const data = ret.map(fn => compileFunction(fn))

  // write functions to app db
  const app_accessor = await getApplicationDbAccessor(app)
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.function_collection)
      await app_coll.deleteMany({}, { session })
      await app_coll.insertMany(data, { session })
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
    await app_accessor.close()
  }
}

/**
  * Publish one function
  * Means that copying sys db function to app db
  */
export async function publishOneFunction(app: ApplicationStruct, func_id: string) {

  // read functions from sys db
  const func = await getFunctionById(app.appid, new ObjectId(func_id))

  // compile functions
  compileFunction(func)

  // write function to app db
  const app_accessor = await getApplicationDbAccessor(app)
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.function_collection)
      await app_coll.deleteOne({ _id: new ObjectId(func_id) }, { session })
      await app_coll.insertOne(func as any, { session })
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}

/**
 * Compile function codes (from typescript to javascript)
 * @param func 
 */
function compileFunction(func: any) {
  func.compiledCode = compileTs2js(func.code)
  return func
}

/**
  * Deploy functions which pushed from remote environment
  */
export async function deployFunctions(appid: string, functions: CloudFunctionStruct[]) {
  assert.ok(functions)
  assert.ok(functions instanceof Array)

  const accessor = DatabaseAgent.sys_accessor

  const data = functions
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const func of data) {
        func['appid'] = appid
        await _deployOneFunction(func, session)
      }
    })
  } finally {
    await session.endSession()
  }
}

/**
 * Deploy a function, use in `deployFunctions()`
 * @param func the cloud function to be deployed
 * @param session mongodb session for transaction operations
 * @private
 * @see deployFunctions()
 * @returns 
 */
async function _deployOneFunction(func: CloudFunctionStruct, session: ClientSession) {
  const db = DatabaseAgent.sys_accessor.db
  const data = {
    ...func,
  }
  delete data['_id']
  const r = await db.collection(Constants.cn.functions)
    .updateOne({
      appid: func.appid,
      name: func.name
    }, {
      $set: data
    }, { session })

  // return if exists & updated 
  if (r.matchedCount) {
    logger.debug(`deploy function: found an exists function ${func.name} & updated it, matchedCount ${r.matchedCount}`)
    return
  }

  // if new function
  const ret = await db.collection(Constants.cn.functions)
    .insertOne(data as any, { session })

  assert(ret.insertedId, `deploy: add function ${func.name} occurred error`)
  logger.debug(`deploy function: inserted a function (${func.name}),  insertedId ${ret.insertedId}`)
}