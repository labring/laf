/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:34:45
 * @LastEditTime: 2021-08-30 16:35:57
 * @Description: 
 */

import { Request, Response } from 'express'
import { checkPermission } from '../../api/permission'
import { getToken } from '../../lib/utils/token'
import { Constants } from '../../constants'
import { getApplicationById } from '../../api/application'


/**
 * Create a deployment token
 */
export async function handleCreateDeployToken(req: Request, res: Response) {
  const { permissions, expire, source } = req.body
  if (!permissions || !permissions?.length) return res.status(422).send('invalid permissions')
  if (!expire) return res.status(422).send('invalid expire')
  if (!source) return res.status(422).send('invalid source')

  const uid = req['auth']?.uid
  const appid = req.params.appid
  const app = await getApplicationById(appid)
  if (!app) return res.status(422).send('app not found')

  // check permission
  const PN_TOKEN_CREATE = Constants.permissions.DEPLOY_TOKEN_CREATE.name
  const code = await checkPermission(uid, PN_TOKEN_CREATE, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    const expired_at = Math.floor(Date.now() / 1000 + expire * 3600)
    const payload = { type: "deploy", pns: permissions, exp: expired_at, src: source, appid }
    const token = getToken(payload)

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
