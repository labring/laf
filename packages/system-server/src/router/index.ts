/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-30 17:18:08
 * @Description: 
 */

import { Router } from 'express'
import { AccountRouter } from './account/index'
import { DbmRouter } from './dbm'
import { DatabaseAgent } from '../lib/db-agent'
import { DeployRouter } from './deploy'
import { FileRouter } from './file'
import { ApplicationRouter } from './application'
import { FunctionRouter } from './function'
import { PolicyRouter } from './policy'

export const router = Router()

router.use('/account', AccountRouter)
router.use('/apps', ApplicationRouter)

router.use('/apps/:appid/function', FunctionRouter)
router.use('/apps/:appid/policy', PolicyRouter)
router.use('/apps/:appid/dbm', DbmRouter)
router.use('/apps/:appid/deploy', DeployRouter)
router.use('/apps/:appid/file', FileRouter)

router.use('/health-check', (_req, res) => {
  if (!DatabaseAgent.sys_accessor.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})