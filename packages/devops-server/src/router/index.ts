import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { DevOpsEntryRouter } from './entry'
import { DbmRouter } from './dbm'
import { PublishRouter } from './publish'

export const router = Router()

router.use('/admin', DevOpsEntryRouter)
router.use('/admin', AdminRouter)
router.use('/dbm', DbmRouter)
router.use('/publish', PublishRouter)