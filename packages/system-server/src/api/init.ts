import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"


/**
 * Create system db collection indexes
 */
export async function createSystemCollectionIndexes() {
  const sys_accessor = DatabaseAgent.sys_accessor
  await sys_accessor.ready
  await sys_accessor.db.collection(Constants.cn.accounts).createIndex('username', { unique: true })
  await sys_accessor.db.collection(Constants.cn.applications).createIndex('appid', { unique: true })
  await sys_accessor.db.collection(Constants.cn.functions).createIndex({ appid: 1, name: 1 }, { unique: true })
  await sys_accessor.db.collection(Constants.cn.policies).createIndex({ appid: 1, name: 1 }, { unique: true })
}