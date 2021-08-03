import { Router } from 'express'
import { EntryRouter } from './entry'
import { FileRouter } from './file/index'
import { FunctionRouter } from './function/index'
import { PackageTypingRouter } from './typing'
export const router = Router()

router.use(EntryRouter)

router.use('/file', FileRouter)
router.use('/func', FunctionRouter)
router.use('/typing', PackageTypingRouter)