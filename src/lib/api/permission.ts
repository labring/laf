
import assert = require('assert')
import { db } from '../../lib/db'

/**
 * 通过 role ids 获取权限列表
 * @param role_ids 
 * @returns 
 */
export async function getPermissions(uid: string) {

  // 查用户
  const { data: [admin] } = await db.collection('admins')
    .where({ uid })
    .get()

  assert(admin, 'getPermissions failed')

  // 查角色
  const { data: roles } = await db.collection('roles')
    .where({
      name: {
        $in: admin.roles ?? []
      }
    })
    .get()

  if (!roles) {
    return { permissions: [], roles: [], user: admin }
  }

  const permissions = []
  for (const role of roles) {
    const perms = role.permissions ?? []
    permissions.push(...perms)
  }

  return {
    permissions,
    roles: roles.map(role => role.name),
    user: admin
  }
}