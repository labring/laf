/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:59:07
 * @Description: 
 */

import { Request, Response } from 'express'
import { FunctionContext } from '../support/function-engine'
import Config from '../config'
import { logger } from '../support/logger'
import { addFunctionLog } from '../support/function-log'
import { CloudFunction } from '../support/function-engine'

const DEFAULT_FUNCTION_NAME = '__default__'

/**
 * Handler of invoking cloud function
 */
export async function handleInvokeFunction(req: Request, res: Response) {
  const requestId = req['requestId']
  const func_name = req.params?.name

  // load function data from db
  let funcData = await CloudFunction.getFunctionByName(func_name)
  if (!funcData) {
    if (func_name === 'healthz') {
      return res.status(200).send('ok')
    }

    // load default function from db
    funcData = await CloudFunction.getFunctionByName(DEFAULT_FUNCTION_NAME)
    if (!funcData) {
      return res.status(404).send('Not Found')
    }
  }

  const func = new CloudFunction(funcData)

  // reject while no HTTP enabled
  if (!func.enableHTTP) {
    return res.status(404).send('Not Found')
  }

  // reject while func was disabled
  if (1 !== func.status) {
    return res.status(404).send('Not Found')
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
      request: req,
      response: res,
    }
    const result = await func.invoke(ctx)

    // log this execution to db
    if (Config.ENABLE_CLOUD_FUNCTION_LOG === 'always') {
      await addFunctionLog({
        requestId: requestId,
        method: req.method,
        func_id: func.id,
        func_name: func_name,
        logs: result.logs,
        time_usage: result.time_usage,
        created_by: req['auth']?.uid,
        data: result.data,
        error: result.error,
        debug: false
      })
    }

    if (result.error) {
      logger.error(requestId, `invoke function ${func_name} invoke error: `, result)

      return res.status(400).send({
        error: 'invoke cloud function got error, please check the function logs',
        requestId
      })
    }

    logger.trace(requestId, `invoke function ${func_name} invoke success: `, result)

    if (res.writableEnded === false) {
      return res.send(result.data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return res.status(500).send('Internal Server Error')
  }
}