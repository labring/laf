/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-13 20:16:56
 * @Description: 
 */

import { Router } from 'express'
import { CloudFunction } from 'cloud-function-engine'
import * as multer from 'multer'
import * as path from 'path'
import * as uuid from 'uuid'
import { handleDebugFunction } from './debug'
import { handleInvokeFunction } from './invoke'

/**
 * Custom require function in cloud function
 * @see CloudFunction.require_func
 * @param module the module id. ex. `path`, `lodash`
 * @returns 
 */
CloudFunction.require_func = (module): any => {
  if (module === '@/cloud-sdk') {
    return require('../../cloud-sdk')
  }
  return require(module) as any
}

export const FunctionRouter = Router()

/**
 * multer uploader config
 */
const uploader = multer({
  storage: multer.diskStorage({
    filename: (_req, file, cb) => {
      const { ext } = path.parse(file.originalname)
      cb(null, uuid.v4() + ext)
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
