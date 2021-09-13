/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-13 22:09:23
 * @Description: 
 */

import { Request, Response } from 'express'
import { FunctionContext, CloudFunction } from 'cloud-function-engine'
import { getFunctionByName } from '../../api/function'
import Config from '../../config'
import { logger } from '../../lib/logger'
import { addFunctionLog } from '../../api/function-log'


/**
 * Handler of invoking cloud function
 */
export async function handleInvokeFunction(req: Request, res: Response) {
  const requestId = req['requestId']
  const func_name = req.params?.name

  // load function data from db
  const funcData = await getFunctionByName(func_name)
  if (!funcData) {
    return res.send({ code: 1, error: 'function not found', requestId })
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
      response: res,
    }
    const result = await func.invoke(ctx)

    // log this execution to db
    if (Config.ENABLE_CLOUD_FUNCTION_LOG === 'always') {
      await addFunctionLog({
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
        debug: false
      })
    }

    if (result.error) {
      logger.error(requestId, `invoke function ${func_name} invoke error: `, result)

      return res.status(400).send({
        error: 'invoke function got error',
        detail: Config.isProd ? undefined : result.error,
        logs: Config.isProd ? undefined : result.logs
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