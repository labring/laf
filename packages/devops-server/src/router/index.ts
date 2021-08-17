import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { DevOpsEntryRouter } from './entry'
import { DbmRouter } from './dbm'
import { PublishRouter } from './publish'
import { DatabaseAgent } from '../lib/db-agent'
import { DeployRouter } from './deploy'

export const router = Router()

router.use('/admin', DevOpsEntryRouter)
router.use('/admin', AdminRouter)
router.use('/dbm', DbmRouter)
router.use('/publish', PublishRouter)
router.use('/deploy', DeployRouter)

router.use('/health-check', (_req, res) => {
  if (!DatabaseAgent.sys_accessor.db || !DatabaseAgent.app_accessor.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})