/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 16:39:06
 * @Description: 
 */

import * as assert from 'assert'
import { Constants } from '../constants'
import { DatabaseAgent } from '../lib/db-agent'

const db = DatabaseAgent.sys_db

/**
 * Check if a user have pointed permission
 * @param uid the user id
 * @param permission the permission name
 * @returns 0 means ok, 401 means unauthorized, 403 means permission denied
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
 * Get granted permissions and roles by user id 
 * @param uid the user id 
 * @returns 
 */
export async function getPermissions(uid: string) {

  // get user info
  const { data: admin } = await db.collection(Constants.cn.admins)
    .where({ _id: uid })
    .getOne()

  assert(admin, 'getPermissions failed')

  // get user's roles
  const { data: roles } = await db.collection(Constants.cn.roles)
    .where({
      name: {
        $in: admin.roles ?? []
      }
    })
    .get()

  if (!roles) {
    return { permissions: [], roles: [], user: admin }
  }

  // get user's permissions
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