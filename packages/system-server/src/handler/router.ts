/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-05 23:52:32
 * @Description: 
 */

import { Request, Response, Router } from 'express'
import { AccountRouter } from './account/index'
import { DbmRouter } from './dbm'
import { DatabaseAgent } from '../db'
import { ApplicationRouter } from './application'
import { FunctionRouter } from './function'
import { PolicyRouter } from './policy'
import { getApplicationByAppid } from '../support/application'
import { OSSRouter } from './oss'
import { ReplicateRouter } from './replicate'
import { WebsiteRouter } from './website'

export const router = Router()

router.use('/account', AccountRouter)
router.use('/apps', ApplicationRouter)

router.use('/apps/:appid/function', checkAppid, FunctionRouter)
router.use('/apps/:appid/policy', checkAppid, PolicyRouter)
router.use('/apps/:appid/dbm', checkAppid, DbmRouter)
router.use('/apps/:appid/oss', checkAppid, OSSRouter)
router.use('/apps/:appid/replicate', checkAppid, ReplicateRouter)
router.use('/apps/:appid/websites', checkAppid, WebsiteRouter)


router.use('/healthz', (_req, res) => {
  if (!DatabaseAgent.sys_accessor.db)
    return res.status(400).send('no db connection')

  return res.status(200).send('ok')
})

/**
 * Middleware of checking appid & retrieving application data
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
async function checkAppid(req: Request, res: Response, next: any) {
  const appid = req.params.appid
  const app = await getApplicationByAppid(appid)

  if (!app)
    return res.status(422).send('app not found')

  // set the app object to request['parsed-app'] for re-using in request handlers
  req['parsed-app'] = app
  next(null, req, res)
}