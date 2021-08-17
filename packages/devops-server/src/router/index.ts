/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-17 18:59:52
 * @Description: 
 */

import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { DevOpsEntryRouter } from './entry'
import { DbmRouter } from './dbm'
import { PublishRouter } from './publish'
import { DatabaseAgent } from '../lib/db-agent'
import { DeployRouter } from './deploy'
import { FileRouter } from './file'

export const router = Router()

router.use('/admin', DevOpsEntryRouter)
router.use('/admin', AdminRouter)
router.use('/dbm', DbmRouter)
router.use('/publish', PublishRouter)
router.use('/deploy', DeployRouter)
router.use('/file', FileRouter)

router.use('/health-check', (_req, res) => {
  if (!DatabaseAgent.sys_accessor.db || !DatabaseAgent.app_accessor.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})