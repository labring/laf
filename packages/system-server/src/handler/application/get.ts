/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 15:22:34
 * @LastEditTime: 2021-12-27 11:39:53
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid, getMyApplications, getMyJoinedApplications, getUserGroupsOfApplication } from '../../support/application'
import { getActionsOfRoles } from '../../support/permission'
import { getToken } from '../../support/token'
import Config from '../../config'
import { ApplicationSpecSupport } from '../../support/application-spec'
import { FunctionActionDef } from '../../actions'


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
  const roles = getUserGroupsOfApplication(uid, app)
  if (!roles.length) {
    return res.status(403).send()
  }

  // get user permissions of the application
  const permissions = getActionsOfRoles(roles)

  // generate token of debugging cloud function
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * Config.TOKEN_EXPIRED_TIME
  let debug_token = undefined
  if (permissions.includes(FunctionActionDef.InvokeFunction)) {
    debug_token = getToken({ appid, type: 'debug', exp }, app.config.server_secret_salt)
  }

  let export_port = Config.APP_SERVICE_DEPLOY_URL_SCHEMA === 'http' ? Config.PUBLISH_PORT :  Config.PUBLISH_HTTPS_PORT

  const app_deploy_host = Config.APP_SERVICE_DEPLOY_HOST + ':' + export_port
  const app_deploy_url_schema = Config.APP_SERVICE_DEPLOY_URL_SCHEMA
  const oss_external_endpoint = Config.MINIO_CONFIG.endpoint.external
  const oss_internal_endpoint = Config.MINIO_CONFIG.endpoint.internal

  const spec = await ApplicationSpecSupport.getValidAppSpec(appid)

  app.config = undefined
  return res.send({
    data: {
      application: app,
      permissions,
      roles,
      debug_token,
      app_deploy_host,
      app_deploy_url_schema,
      oss_external_endpoint,
      oss_internal_endpoint,
      spec
    }
  })
}