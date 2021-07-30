
import { Constants } from "../constants"
import { Globals } from "../lib/globals"

const db = Globals.sys_db

/**
 * 请求触发器列表
 * @param status 默认为1，取所有开启的触发器
 * @returns 
 */
export async function getTriggers(status = 1) {
  const r = await db.collection('__triggers')
    .where({ status: status })
    .get()

  return r.data
}

/**
 * 根据ID请求触发器
 * @param id 
 * @returns 
 */
export async function getTriggerById(id: string) {
  const r = await db.collection('__triggers')
    .where({ _id: id })
    .getOne()

  return r.data
}


/**
  * 发布触发器
  * 实为将 sys db __triggers 集合，复制其数据至 app db 中
  */
 export async function publishTriggers() {
  const logger = Globals.logger

  const app_accessor = Globals.app_accessor
  const ret = await Globals.sys_accessor.db.collection('__triggers').find().toArray()
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.trigger_collection)
      await app_coll.deleteMany({})
      await app_coll.insertMany(ret)
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}