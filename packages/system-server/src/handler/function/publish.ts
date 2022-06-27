/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-30 16:51:19
 * @LastEditTime: 2021-11-02 14:51:42
 * @Description: 
 */

import { Request, Response } from 'express'
import { IApplicationData } from '../../support/application'
import { publishFunctions, publishOneFunction, publishOneFunctionByName } from '../../support/function'
import { checkPermission } from '../../support/permission'
import Config from '../../config'
import { FunctionActionDef } from '../../actions'
import { logger } from '../../support/logger'


/**
 * Publish functions
 */
export async function handlePublishFunctions(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.PublishFunction, app)
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
    logger.error(`public functions occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}


/**
 * Publish one function
 */
export async function handlePublishOneFunction(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const func_id = req.params?.func_id
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.PublishFunction, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishOneFunction(app, func_id)

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    logger.error(`public functions occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}


/**
 * Publish one function by name
 */
 export async function handlePublishOneFunctionByName(req: Request, res: Response) {
  const uid = req['auth']?.uid
  const func_name = req.params?.func_name
  const app: IApplicationData = req['parsed-app']

  // check permission
  const code = await checkPermission(uid, FunctionActionDef.PublishFunction, app)
  if (code) {
    return res.status(code).send()
  }

  try {
    await publishOneFunctionByName(app, func_name)

    return res.send({
      code: 0,
      data: 'ok'
    })
  } catch (error) {
    logger.error(`public functions occurred error`, error)
    return res.status(500).send(Config.isProd ? undefined : error)
  }
}
