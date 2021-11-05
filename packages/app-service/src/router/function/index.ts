/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-05 13:53:31
 * @Description: 
 */

import { Router } from 'express'
import * as multer from 'multer'
import * as path from 'path'
import { handleDebugFunction } from './debug'
import { handleInvokeFunction } from './invoke'
import { generateUUID } from '../../lib/utils/rand'

export const FunctionRouter = Router()

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

/**
 * Debug cloud function through HTTP request.
 * @method POST
 */
FunctionRouter.post('/debug/:name', uploader.any(), handleDebugFunction)

/**
 * Invoke cloud function through HTTP request.
 * @method *
 */
FunctionRouter.all('/:name', uploader.any(), handleInvokeFunction)

/**
 * Invoke cloud function through HTTP request.
 * Alias for `/:name` for fallback to old version api
 * @method *
 */
FunctionRouter.all('/invoke/:name', uploader.any(), handleInvokeFunction)
