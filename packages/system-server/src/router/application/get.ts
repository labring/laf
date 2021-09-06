/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-05 00:45:55
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct, getApplicationByAppid, getMyApplications, getMyJoinedApplications } from '../../api/application'
import { getPermissionsOfRoles } from '../../api/permission'
import { Constants } from '../../constants'
import { getToken } from '../../utils/token'
import Config from '../../config'

const { FUNCTION_DEBUG, FILE_ADD } = Constants.permissions

/**
 * The handler of getting my applications(created & joined)
 */
export async function handleMyApplications(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const created = await getMyApplications(uid)
  const joined = await getMyJoinedApplications(uid)

  return res.send({
    data: {
      created,
      joined
    }
  })
}

/**
 * The handler of getting application by id
 * @param req 
 * @param res 
 * @returns 
 */
export async function handleGetApplicationByAppid(req: Request, res: Response) {
  const uid = req['auth']?.uid
  if (!uid)
    return res.status(401).send()

  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app)
    return res.status(422).send('invalid appid')

  // get user roles of the application
  const roles = getUserRolesOfApplication(uid, app)
  if (!roles.length) {
    return res.status(403).send()
  }

  // get user permissions of the application
  const permissions = getPermissionsOfRoles(roles)

  // generate token of debugging cloud function
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * Config.TOKEN_EXPIRED_TIME
  let debug_token = undefined
  if (permissions.includes(FUNCTION_DEBUG.name)) {
    debug_token = getToken({ appid, type: 'debug', exp }, app.config.server_secret_salt)
  }

  // generate token of file uploading & downloading
  let file_token = undefined
  if (permissions.includes(FILE_ADD.name)) {
    const payload = {
      exp, appid, bucket: '*', ops: ['create', 'read']
    }
    file_token = getToken(payload, app.config.server_secret_salt)
  }

  app.config = undefined
  return res.send({
    data: {
      application: app,
      permissions,
      roles,
      debug_token,
      file_token
    }
  })
}

/**
 * Get user's roles of an application
 * @param uid 
 * @param app 
 * @returns 
 */
function getUserRolesOfApplication(uid: string, app: ApplicationStruct) {
  if (app.created_by === uid) {
    return [Constants.roles.owner.name]
  }

  // reject if not the collaborator
  const [found] = app.collaborators.filter(co => co.uid === uid)
  if (!found) {
    return []
  }

  return found.roles
}