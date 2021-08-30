/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 15:48:51
 * @Description: 
 */

import * as assert from 'assert'
import { Constants } from '../constants'
import { ApplicationStruct } from './application'

/**
 * Check if a user have permission for application
 * @param uid the account id
 * @param permission the permission name
 * @param app the application which checked for
 * @returns 0 means ok, 401 means unauthorized, 403 means permission denied
 */
export async function checkPermission(uid: string, permission: string, app: ApplicationStruct): Promise<number> {
  if (!uid) return 401
  assert.ok(permission, 'empty permission got')
  assert.ok(app, 'empty app got')

  // pass directly while the app owner here
  if (uid === app.created_by) return 0

  // reject while uid is not the collaborator
  const [collaborator] = app.collaborators?.filter(co => co.uid === uid) ?? []
  if (!collaborator) return 403

  // reject while uid not have the permission
  const roles = collaborator.roles
  const permissions = getPermissionsOfRoles(roles)
  if (!permissions.includes(permission)) {
    return 403
  }

  return 0
}

/**
 * Get permission names by a list of role names
 * @param roles_names The role names
 * @returns 
 */
export function getPermissionsOfRoles(roles_names: string[]) {
  const permissions = []
  for (const name of roles_names) {
    const pns = Constants.roles[name]?.permissions ?? []
    permissions.push(...pns)
  }

  return permissions.map(pn => pn.name)
}