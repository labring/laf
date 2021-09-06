
import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import * as assert from 'assert'

/**
 * Get an account by account_id
 */
export async function getAccountByAppid(uid: string) {
  assert.ok(uid, 'empty uid got')

  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.accounts)
    .where({ _id: uid })
    .getOne()

  return ret.data
}