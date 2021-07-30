
import { Constants } from "../constants"
import { Globals } from "../lib/globals"
import { compileTs2js } from 'cloud-function-engine/dist/utils'

const db = Globals.sys_db

/**
 * 根据函数名获取云函数
 * @param func_name 
 * @returns 
 */
export async function getFunctionByName(func_name: string) {
  const r = await db.collection('__functions')
    .where({ name: func_name })
    .getOne()

  if (!r.ok) {
    throw new Error(`getCloudFunction() failed to get function [${func_name}]: ${r.error.toString()}`)
  }

  return r.data
}

/**
  * 根据ID获取云函数
  * @param func_name 
  * @returns 
  */
export async function getFunctionById(func_id: string) {
  // 获取函数
  const r = await db.collection('__functions')
    .where({ _id: func_id })
    .getOne()

  if (!r.ok) {
    throw new Error(`getCloudFunctionById() failed to get function [${func_id}]: ${r.error.toString()}`)
  }

  return r.data
}



/**
  * 发布云函数
  * 实为将 sys db __functions 集合，复制其数据至 app db 中
  */
export async function publishFunctions() {
  const logger = Globals.logger

  const app_accessor = Globals.app_accessor
  const ret = await Globals.sys_accessor.db.collection('__functions').find().toArray()

  // compile
  const data = ret.map(fn => compileFunction(fn))

  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.function_collection)
      await app_coll.deleteMany({})
      await app_coll.insertMany(data)
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}

/**
 * 编译函数
 * @param func 
 */
function compileFunction(func: any) {
  func.compiledCode = compileTs2js(func.code)
  return func
}
