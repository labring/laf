/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-12-09 08:22:20
 * @Description: 
 */

import * as assert from 'assert'
import { Groups } from '../groups'
import { getUserGroupsOfApplication, IApplicationData } from './application'

/**
 * Check if a user have permission for application
 * @param uid the account id
 * @param action the permission name
 * @param app the application which checked for
 * @returns 0 means ok, 401 means unauthorized, 403 means permission denied
 */
export async function checkPermission(uid: string, action: string, app: IApplicationData): Promise<number> {
  if (!uid) return 401
  assert.ok(action, 'empty permission got')
  assert.ok(app, 'empty app got')

  // pass directly while the app owner here
  if (uid === app.created_by.toHexString()) return 0

  // reject if not the collaborator
  const roles = getUserGroupsOfApplication(uid, app)
  if (!roles.length) return 403

  // reject if not the permission
  const actions = getActionsOfRoles(roles)
  if (!actions.includes(action)) return 403

  return 0
}

/**
 * Get permission names by a list of role names
 * @param roles_names The role names
 * @returns 
 */
export function getActionsOfRoles(roles_names: string[]) {
  const rets = []
  for (const name of roles_names) {
    const role = Groups.find(it => it.name === name)
    const actions = role?.actions ?? []
    rets.push(...actions)
  }

  return rets
}
