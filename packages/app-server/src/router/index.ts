/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 15:39:40
 * @Description: 
 */

import { Router } from 'express'
import { DatabaseAgent } from '../lib/database'
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
  if (!DatabaseAgent.accessor.db) {
    return res.status(400).send('no db connection')
  }
  return res.status(200).send('ok')
})