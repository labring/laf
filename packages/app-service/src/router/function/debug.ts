/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 21:37:48
 * @Description: 
 */

import { Request, Response } from 'express'
import { FunctionContext, CloudFunction } from 'cloud-function-engine'
import { getFunctionByName } from '../../api/function'
import { parseToken } from '../../lib/utils/token'
import { logger } from '../../lib/logger'
import { addFunctionLog } from '../../api/function-log'

/**
 * Handler of debugging cloud function
 */
export async function handleDebugFunction(req: Request, res: Response) {

  const requestId = req['requestId']
  const func_name = req.params?.name
  const debug_token = req.get('debug-token') ?? undefined

  // verify the debug token
  const parsed = parseToken(debug_token as string)
  if (!parsed || parsed.type !== 'debug') {
    return res.status(403).send('permission denied: invalid debug token')
  }

  // load function data from db
  const funcData = await getFunctionByName(func_name)
  if (!funcData) {
    return res.send({ code: 1, error: 'function not found', requestId })
  }

  const func = new CloudFunction(funcData)

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
      response: res
    }
    const result = await func.invoke(ctx)

    // log this execution to db
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
      debug: true
    })

    if (result.error) {
      logger.error(requestId, `debug function ${func_name} error: `, result)
      return res.send({
        error: 'invoke function got error: ' + result.error.toString(),
        logs: result.logs,
        time_usage: result.time_usage,
        requestId
      })
    }

    logger.trace(requestId, `invoke ${func_name} invoke success: `, result)

    if (res.writableEnded === false) {
      return res.send(result.data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return res.status(500).send('Internal Server Error')
  }
}