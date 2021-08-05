import { Router } from 'express'
import { Globals } from '../lib/globals'
import { EntryRouter } from './entry'
import { FileRouter } from './file/index'
import { FunctionRouter } from './function/index'
import { PackageTypingRouter } from './typing'
export const router = Router()

router.use(EntryRouter)

router.use('/file', FileRouter)
router.use('/func', FunctionRouter)
router.use('/typing', PackageTypingRouter)
router.use('/health-check', (_req, res) => {
  if (!Globals.accessor.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})