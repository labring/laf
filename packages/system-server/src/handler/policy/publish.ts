/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-09-10 00:42:50
 * @Description: 
 */

import { Request, Response } from 'express'
import { ApplicationStruct } from '../../support/application'
import { checkPermission } from '../../support/permission'
import { publishAccessPolicies } from '../../support/policy'
import Config from '../../config'
import { permissions } from '../../permissions'
import { logger } from '../../logger'

const { PUBLISH_POLICY } = permissions


/**
 * Publish policies
 */
export async function handlePublishPolicies(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: ApplicationStruct = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, PUBLISH_POLICY.name, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishAccessPolicies(app)

    return res.send({
      data: 'ok'
    })
  } catch (error) {
    logger.error(`public triggers occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}