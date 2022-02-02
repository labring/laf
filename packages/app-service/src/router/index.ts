/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:32:16
 * @Description: 
 */

import { Router, Request, Response } from 'express'

import Config from '../config'
import { DatabaseAgent } from '../lib/database'
import { DatabaseProxyRouter } from './proxy'
import { FunctionRouter } from './function/index'
import { PackageTypingRouter } from './typing'
export const router = Router()

router.use(DatabaseProxyRouter)

router.use('/func', FunctionRouter)
router.use('/typing', PackageTypingRouter)
router.use('/health-check', (_req: Request, res: Response) => {
  if (!DatabaseAgent.db) {
    return res.status(400).send('no db connection')
  }
  return res.send({
    APP_ID: Config.APP_ID,
    RUNTIME_VERSION: Config.RUNTIME_VERSION,
    RUNTIME_IMAGE: Config.RUNTIME_IMAGE
  })
})