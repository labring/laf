import * as assert from 'assert'
import { Constants } from '../constants'
import { Globals } from "../lib/globals"
import { ClientSession, ObjectId } from 'mongodb'


/**
 * 发布访问策略
 * 实为将 sys_db policies 中的文档，复制其数据至 app_db 中
 */
export async function publishAccessPolicy() {
  const logger = Globals.logger

  const app_accessor = Globals.app_accessor
  const ret = await Globals.sys_accessor.db.collection(Constants.cn.policies).find().toArray()
  const session = app_accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      const _db = app_accessor.db
      const app_coll = _db.collection(Constants.policy_collection)
      await app_coll.deleteMany({}, { session })
      await app_coll.insertMany(ret, { session })
    })
  } catch (error) {
    logger.error(error)
  } finally {
    await session.endSession()
  }
}


/**
  * 部署访问策略
  * 应用远程推送过来的部署请求
  */
export async function deployPolicies(policies) {
  assert.ok(policies)
  assert.ok(policies instanceof Array)
  const logger = Globals.logger

  const accessor = Globals.sys_accessor

  const data = policies
  const session = accessor.conn.startSession()

  try {
    await session.withTransaction(async () => {
      for (const item of data) {
        await _deployOnePolicy(item, session)
      }
    })
  } catch (error) {
    logger.error(error)
    throw error
  } finally {
    await session.endSession()
  }
}

async function _deployOnePolicy(policy: any, session: ClientSession) {

  await _deletePolicyWithSameNameButNotId(policy, session)

  const db = Globals.sys_accessor.db
  const r = await db.collection(Constants.cn.policies).findOne({ _id: new ObjectId(policy._id) }, { session })

  const data = {
    ...policy
  }


  // if exists
  if (r) {
    delete data['_id']
    const ret = await db.collection(Constants.cn.policies).updateOne({ _id: r._id }, {
      $set: data
    }, { session })

    assert(ret.matchedCount, `deploy: update policy ${policy.name} occurred error`)
    return
  }

  // if new
  data._id = new ObjectId(data._id) as any
  const ret = await db.collection(Constants.cn.policies).insertOne(data as any, { session })
  assert(ret.insertedId, `deploy: add policy ${policy.name} occurred error`)
}

/**
 * 删除本地 _id 不同，但 name 相同的策略（若存在）
 * @param func 
 */
async function _deletePolicyWithSameNameButNotId(policy: any, session: ClientSession) {
  const db = Globals.sys_accessor.db
  await db.collection(Constants.cn.policies).findOneAndDelete({
    _id: {
      $ne: new ObjectId(policy._id)
    },
    name: policy.name
  }, { session })
}