
import { CN_ACCOUNTS, CONST_DICTS } from "../constants"
import { DatabaseAgent } from "../db"
import * as assert from 'assert'
import { ObjectId } from "mongodb"

/**
 * Get an account by account_id
 */
export async function getAccountById(uid: string) {
  assert.ok(uid, 'empty uid got')

  const db = DatabaseAgent.db
  const doc = await db.collection(CN_ACCOUNTS)
    .findOne({ _id: new ObjectId(uid) })

  return doc
}

/**
 * Get an account by username
 */
export async function getAccountByUsername(username: string) {
  assert.ok(username, 'empty username got')

  const db = DatabaseAgent.db
  const doc = await db.collection(CN_ACCOUNTS)
    .findOne({ username: username })

  return doc
}

/**
 * Check if given account id is valid
 * @param uid 
 * @returns 
 */
export async function isValidAccountId(uid: string) {
  if (!uid) return false
  const account = await getAccountById(uid)
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
  return CONST_DICTS.roles
}