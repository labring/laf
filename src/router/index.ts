import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { AdminEntryRouter } from './entry/admin'
import { AppEntryRouter } from './entry/app'
import { FileRouter } from './file/index'
import { FunctionRouter } from './function/index'
import { DbmRouter } from './dbm'
export const router = Router()

router.use('/admin', AdminEntryRouter)
router.use('/admin', AdminRouter)
router.use('/admin', DbmRouter)

router.use('/app', AppEntryRouter)

router.use('/file', FileRouter)
router.use('/func', FunctionRouter)