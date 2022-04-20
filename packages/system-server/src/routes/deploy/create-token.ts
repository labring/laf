/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:34:45
 * @LastEditTime: 2021-09-06 16:08:37
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { getToken } from '../../api/utils/token'
import { Constants } from '../../constants'
import { ApplicationStruct } from '../../api/application'


const { DEPLOY_TOKEN_CREATE } = Constants.permissions
/**
 * Create a deployment token
 */
export async function handleCreateDeployToken(req: Request, res: Response) {
  const { permissions, expire, source } = req.body
  if (!permissions || !permissions?.length) return res.status(422).send('invalid permissions')
  if (!expire) return res.status(422).send('invalid expire')
  if (!source) return res.status(422).send('invalid source')

  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, DEPLOY_TOKEN_CREATE.name, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    const expired_at = Math.floor(Date.now() / 1000 + expire * 3600)
    const payload = { type: "deploy", pns: permissions, exp: expired_at, src: source, appid: app.appid }
    const token = getToken(payload, app.config.server_secret_salt)

    return res.send({
      code: 0,
      data: {
        source,
        token,
        expired_at,
        permissions
      }
    })
  } catch (error) {
    return res.send({
      code: 1,
      error: error.toString()
    })
  }
}
