
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

/**
 * Get an account by username
 */
 export async function getAccountByUsername(username: string) {
  assert.ok(username, 'empty username got')

  const db = DatabaseAgent.sys_db
  const ret = await db.collection(Constants.cn.accounts)
    .where({ username: username })
    .getOne()

  return ret.data
}

/**
 * Check if given account id is valid
 * @param uid 
 * @returns 
 */
export async function isValidAccountId(uid: string) {
  if (!uid) return false
  const account = await getAccountByAppid(uid)
  return account ? true : false
}

/**
 * Check if given role names are valid
 * @param role_names 
 */
export function isValidRoleNames(role_names: string[]): boolean {
  if (!(role_names instanceof Array))
    return false

  const roles = getRoles()
  for (const rn of role_names)
    if (!roles[rn]) return false

  return true
}

/**
 * Get roles
 * @returns 
 */
export function getRoles() {
  return Constants.roles
}