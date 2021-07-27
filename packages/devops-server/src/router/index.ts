import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { DevOpsEntryRouter } from './entry/admin'
import { DbmEntryRouter } from './entry/dbm'
import { DbmRouter } from './dbm'
export const router = Router()

router.use('/admin', DevOpsEntryRouter)
router.use('/admin', AdminRouter)
router.use('/admin', DbmRouter)

router.use('/dbm', DbmEntryRouter)
