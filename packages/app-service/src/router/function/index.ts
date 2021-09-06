/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 15:40:09
 * @Description: 
 */

import { Request, Response, Router } from 'express'
import { FunctionContext, CloudFunction } from 'cloud-function-engine'
import * as multer from 'multer'
import * as path from 'path'
import * as uuid from 'uuid'
import { getFunctionByName } from '../../api/function'
import { DatabaseAgent } from '../../lib/database'
import { Constants } from '../../constants'
import { parseToken } from '../../lib/utils/token'
import Config from '../../config'
import { logger } from '../../lib/logger'

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

const db = DatabaseAgent.db

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
 * Invoke cloud function through HTTP request.
 * Using `/invoke` prefix in URI, which support files uploading.
 * @method POST
 */
FunctionRouter.post('/invoke/:name', uploader.any(), handleInvokeFunction)

/**
 * Invoke cloud function through HTTP request.
 * Alias for `/invoke/:name` but no files uploading support.
 * @method *
 */
FunctionRouter.all('/:name', handleInvokeFunction)

/**
 * Handler of invoking cloud function
 */
async function handleInvokeFunction(req: Request, res: Response) {
  const requestId = req['requestId']
  const func_name = req.params?.name
  const debug = req.get('debug-token') ?? undefined

  // verify the debug token
  if (debug) {
    const parsed = parseToken(debug as string)
    if (!parsed || parsed.type !== 'debug') {
      return res.status(403).send('permission denied: invalid debug token')
    }
  }

  // load function data from db
  const funcData = await getFunctionByName(func_name)
  if (!funcData) {
    return res.send({ code: 1, error: 'function not found', requestId })
  }

  const func = new CloudFunction(funcData)

  // reject while no HTTP enabled (except debug mode)
  if (!func.enableHTTP && !debug) {
    return res.status(404).send('Not Found')
  }

  // reject while func was disabled (except debug mode)
  if (1 !== func.status && !debug) {
    return res.status(404).send('Not Found')
  }

  // compile the func while in debug mode or func hadn't been compiled
  if (debug || !func.compiledCode) {
    func.compile2js()

    await db.collection(Constants.function_collection)
      .doc(func.id)
      .update({ compiledCode: func.compiledCode, updated_at: Date.now() })
  }

  try {
    // execute the func
    const ctx: FunctionContext = {
      query: req.query,
      files: req.files as any,
      body: req.body,
      headers: req.headers,
      method: req.method,
      auth: req['auth'],
      requestId,
    }
    const result = await func.invoke(ctx)

    // log this execution to db
    const shouldLog = Config.ENABLE_CLOUD_FUNCTION_LOG === 'always' || (Config.ENABLE_CLOUD_FUNCTION_LOG === 'debug' && debug)
    if (shouldLog) {
      await db.collection(Constants.function_log_collection)
        .add({
          requestId: requestId,
          func_id: func.id,
          func_name: func_name,
          logs: result.logs,
          time_usage: result.time_usage,
          created_at: Date.now(),
          updated_at: Date.now(),
          created_by: req['auth']?.uid,
          data: result.data,
          error: result.error,
          debug: debug ? true : false
        })
    }

    if (result.error) {
      logger.error(requestId, `/func/${func_name} invoke error: `, result)
      return res.send({
        error: 'invoke function got error',
        logs: debug ? result.logs : undefined,
        time_usage: debug ? result.time_usage : undefined,
        requestId
      })
    }

    logger.trace(requestId, `/func/${func_name} invoke success: `, result)

    return res.send({
      requestId,
      data: result.data,
      time_usage: debug ? result.time_usage : undefined,
      logs: debug ? result.logs : undefined
    })
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return res.status(500).send('Internal Server Error')
  }
}