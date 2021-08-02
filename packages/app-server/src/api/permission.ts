
import * as assert from 'assert'
import { Globals } from '../lib/globals/index'

const db = Globals.db

/**
 * 判断用户是否有权限
 * @param uid 用户ID
 * @param permission 权限名
 * @returns 0 表示用户有权限， 401 表示用户未登录， 403 表示用户未授权
 */
export async function checkPermission(uid: string, permission: string): Promise<number> {
  if (!uid) {
    return 401
  }
  const { permissions } = await getPermissions(uid)

  if (!permissions.includes(permission)) {
    return 403
  }
  return 0
}

/**
 * 通过 role ids 获取权限列表
 * @param role_ids 
 * @returns 
 */
export async function getPermissions(uid: string) {

  // 查用户
  const { data: admin } = await db.collection('admins')
    .where({ _id: uid })
    .getOne()

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