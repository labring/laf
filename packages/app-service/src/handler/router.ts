/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:32:16
 * @Description: 
 */

import { Router, Request, Response } from 'express'
import * as multer from 'multer'
import * as path from 'path'
import Config from '../config'
import { DatabaseAgent } from '../db'
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
 * @deprecated compatible for history versions
 * @method POST
 */
router.post('/func/debug/:name', uploader.any(), handleDebugFunction)

/**
 * Debug cloud function through HTTP request.
 * @method POST
 */
router.post('/debug/:name', uploader.any(), handleDebugFunction)


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


router.use('/health-check', (_req: Request, res: Response) => {
  if (!DatabaseAgent.db) {
    return res.status(400).send('no db connection')
  }
  return res.send({
    APP_ID: Config.APP_ID,
    RUNTIME_VERSION: Config.RUNTIME_VERSION,
    RUNTIME_IMAGE: Config.RUNTIME_IMAGE
  })
})