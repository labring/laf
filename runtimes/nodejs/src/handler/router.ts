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
import { handleDebugFunction } from './debug-func'
import { handleInvokeFunction } from './invoke-func'

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


/**
 * Debug cloud function through HTTP request.
 * @method POST
 */
router.all('/debug/:name', uploader.any(), handleDebugFunction)


/**
 * Invoke cloud function through HTTP request.
 * Alias for `/:name` for fallback to old version api
 * @deprecated compatible for history versions
 * @method *
 */
router.all('/func/invoke/:name', uploader.any(), handleInvokeFunction)


/**
 * Invoke cloud function through HTTP request.
 * Alias for `/:name` for fallback to old version api
 * @deprecated compatible for history versions
 * @method *
 */
router.all('/func/:name', uploader.any(), handleInvokeFunction)


/**
 * Invoke cloud function through HTTP request.
 * @method *
 */
router.all('/:name', uploader.any(), handleInvokeFunction)