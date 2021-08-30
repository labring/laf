/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-08-30 17:13:04
 * @Description: 
 */

import { Request, Response } from 'express'
import { getApplicationById } from '../../api/application'
import { publishFunctions } from '../../api/function'
import { checkPermission } from '../../api/permission'
import Config from '../../config'
import { permissions } from '../../constants/permissions'
import { logger } from '../../lib/logger'

const { PUBLISH_FUNCTION } = permissions


/**
 * Publish functions
 */
export async function handlePublishFunctions(req: Request, res: Response) {
  const appid = req.params.appid
  const app = await getApplicationById(appid)
  if (!app) {
    return res.status(422).send('app not found')
  }

  // check permission
  const code = await checkPermission(req['auth']?.uid, PUBLISH_FUNCTION.name, app)
  if (code) {
    return res.status(code).send()
  }

  try {

    await publishFunctions(app)

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    logger.error(`public triggers occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}