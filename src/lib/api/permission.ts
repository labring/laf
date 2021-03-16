
import assert = require('assert')
import { db } from '../../lib/db'

/**
 * 通过 role ids 获取权限列表
 * @param role_ids 
 * @returns 
 */
export async function getPermissions(role_ids: number[]) {
  assert(role_ids, 'getPermissions(): role_ids cannot be empty')
  if (role_ids.length === 0) {
    return []
  }

  const _ = db.command
  const r = await db.collection('permission')
    .leftJoin('role_permission', 'permission_id', 'id')
    .where({
      role_id: _.in(role_ids)
    })
    .get()

  assert(r.ok, 'getPermissions failed: ' + role_ids.join(','))

  return r.data
}

/**
 * 通过用户名获取角色列表
 * @param uid ·
 * @returns 
 */
export async function getRoles(uid: number) {
  const r = await db.collection('user_role')
    .leftJoin('role', 'id', 'role_id')
    .where({ uid })
    .get()

  assert(r.ok, 'getRoles failed')
  return r.data
}