/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:32:16
 * @Description: 
 */

import { Router } from 'express'
import * as multer from 'multer'
import * as path from 'path'
import { handleDatabaseProxy } from './db-proxy'
import { handlePackageTypings } from './typings'
import { generateUUID } from '../support/utils'
import { handleInvokeFunction } from './invoke-func'
import { handlePublishPolicies } from './publish'

/**
 * multer uploader config
 */
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, generateUUID() + ext)
    }
  })
})

export const router = Router()


router.post('/proxy/:policy', handleDatabaseProxy)
router.get('/typing/package', handlePackageTypings)
router.get('/_/healthz', (_req, res) => res.status(200).send('ok'))
router.post('/_/publish/functions', (_req, res) => res.status(400).send('TODO'))
router.post('/_/publish/policies', handlePublishPolicies)

/**
 * Invoke cloud function through HTTP request.
 * @method *
 */
router.all('/:name', uploader.any(), handleInvokeFunction)