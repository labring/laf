/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:59:03
 * @Description: 
 */

import { Request, Response } from 'express'
import { FunctionContext } from '../support/function-engine'
import { logger } from '../support/logger'
import { addFunctionLog } from '../support/function-log'
import { ObjectId } from 'bson'
import { CloudFunction } from '../support/function-engine'

/**
 * Handler of debugging cloud function
 */
export async function handleDebugFunction(req: Request, res: Response) {

  const requestId = req['requestId']
  const func_name = req.params?.name
  const func_data = req.body?.func
  const param = req.body?.param

  if (!func_data) {
    return res.send({ code: 1, error: 'function data not found', requestId })
  }

  // verify the debug token
  const auth = req['auth']
  if (!auth || auth.type !== 'debug') {
    return res.status(403).send('permission denied: invalid debug token')
  }

  const func = new CloudFunction(func_data)

  try {
    // execute the func
    const ctx: FunctionContext = {
      query: req.query,
      files: req.files as any,
      body: param,
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
      method: req.method,
      func_id: new ObjectId(func.id),
      func_name: func_name,
      logs: result.logs,
      time_usage: result.time_usage,
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
      let data = result.data
      if (typeof result.data === 'number') {
        data = Number(result.data).toString()
      }
      return res.send(data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return res.status(500).send('Internal Server Error')
  }
}