/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:32:16
 * @Description:
 */

import { Router } from 'express'
import multer from 'multer'
import * as path from 'path'
import { handleDatabaseProxy } from './db-proxy'
import { handlePackageTypings } from './typings'
import { generateUUID } from '../support/utils'
import { handleInvokeFunction } from './invoke-func'

/**
 * multer uploader config
 */
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, generateUUID() + ext)
    },
  }),
  fileFilter(_req, file, callback) {
    // solve the problem of garbled unicode names
    file.originalname = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    )
    callback(null, true)
  },
})

export const router = Router()

router.post('/proxy/:policy', handleDatabaseProxy)
router.get('/_/typing/package', handlePackageTypings)
router.get('/_/healthz', (_req, res) => res.status(200).send('ok'))

/**
 * Invoke cloud function through HTTP request.
 * @method *
 */
router.all('/:name', uploader.any(), handleInvokeFunction)
