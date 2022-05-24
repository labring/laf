
import { CN_ACCOUNTS } from "../constants"
import { DatabaseAgent } from "../db"
import * as assert from 'assert'
import { ObjectId } from "mongodb"
import { Groups } from "../groups"

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

  for (const rn of role_names) {
    const role = Groups.find(r => r.name === rn)
    if (!role) return false
  }

  return true
}