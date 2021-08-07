
import { Constants } from "../constants"
import { Globals } from "../lib/globals"
import { ObjectId } from 'mongodb'
import * as assert from 'assert'

const db = Globals.sys_db
const logger = Globals.logger

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


/**
  * 部署触发器
  * 应用远程推送过来的部署请求
  */
export async function deployTriggers(triggers: any[]) {
  assert.ok(triggers)
  assert.ok(triggers instanceof Array)
  const logger = Globals.logger

  const accessor = Globals.sys_accessor

  const data = triggers
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const func of data) {
        await _deployOneTrigger(func)
      }
    })
  } catch (error) {
    logger.error(error)
    throw error
  } finally {
    await session.endSession()
  }
}

async function _deployOneTrigger(trigger: any) {

  const db = Globals.sys_accessor.db
  const r = await db.collection('__triggers').findOne({ _id: new ObjectId(trigger._id) })

  const data = {
    ...trigger
  }

  logger.debug('deploy trigger: ', data, r)
  // if exists function
  if (r) {
    delete data['_id']
    const ret = await db.collection('__triggers').updateOne({ _id: r._id }, {
      $set: data
    })

    assert(ret.matchedCount, `deploy: update trigger ${trigger.name} occurred error`)
    return
  }

  // if new function
  data._id = new ObjectId(data._id) as any
  const ret = await db.collection('__triggers').insertOne(data as any)
  assert(ret.insertedId, `deploy: add trigger ${trigger.name} occurred error`)
}