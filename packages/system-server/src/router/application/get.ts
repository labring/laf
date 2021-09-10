/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-09-10 17:10:54
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid, getMyApplications, getMyJoinedApplications, getUserRolesOfApplication } from '../../api/application'
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

  const app_deploy_host = Config.APP_SERVICE_DEPLOY_HOST

  app.config = undefined
  return res.send({
    data: {
      application: app,
      permissions,
      roles,
      debug_token,
      file_token,
      app_deploy_host
    }
  })
}