/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-08-30 17:14:09
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationByAppid } from '../../api/application'
import { checkPermission } from '../../api/permission'
import { publishAccessPolicy } from '../../api/policy'
import Config from '../../config'
import { permissions } from '../../constants/permissions'
import { logger } from '../../lib/logger'

const { PUBLISH_POLICY } = permissions


/**
 * Publish policies
 */
export async function handlePublishPolicies(req: Request, res: Response) {
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const code = await checkPermission(req['auth']?.uid, PUBLISH_POLICY.name, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishAccessPolicy(app)

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    logger.error(`public triggers occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}