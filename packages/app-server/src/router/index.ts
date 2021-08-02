import { Router } from 'express'
import { AdminRouter } from './admin/index'
import { EntryRouter } from './entry'
import { FileRouter } from './file/index'
import { FunctionRouter } from './function/index'
import { PackageTypingRouter } from './typing'
export const router = Router()

router.use(EntryRouter)
router.use('/admin', AdminRouter)

router.use('/file', FileRouter)
router.use('/func', FunctionRouter)
router.use('/typing', PackageTypingRouter)