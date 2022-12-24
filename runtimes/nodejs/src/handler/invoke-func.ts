/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:59:07
 * @Description:
 */

import { Response } from 'express'
import { FunctionContext } from '../support/function-engine'
import { logger } from '../support/logger'
import { CloudFunction } from '../support/function-engine'
import { IRequest } from '../support/types'
import { handleDebugFunction } from './debug-func'
import { parseToken } from '../support/token'

const DEFAULT_FUNCTION_NAME = '__default__'

/**
 * Handler of invoking cloud function
 */
export async function handleInvokeFunction(req: IRequest, res: Response) {
  if (req.get('x-laf-debug-token')) {
    return await handleDebugFunction(req, res)
  }

  let isTrigger = false
  if (parseToken(req.get('x-laf-trigger-token'))) {
    isTrigger = true
  }

  const requestId = req.requestId
  const func_name = req.params?.name

  // load function data from db
  let funcData = await CloudFunction.getFunctionByName(func_name)
  if (!funcData) {
    // load default function from db
    funcData = await CloudFunction.getFunctionByName(DEFAULT_FUNCTION_NAME)
    if (!funcData) {
      return res.status(404).send('Function Not Found')
    }
  }

  const func = new CloudFunction(funcData)

  // reject while no HTTP enabled
  if (!func.methods.includes(req.method.toUpperCase()) && !isTrigger) {
    return res.status(405).send('Method Not Allowed')
  }

  try {
    // execute the func
    const ctx: FunctionContext = {
      query: req.query,
      files: req.files as any,
      body: req.body,
      headers: req.headers,
      method: isTrigger ? 'trigger' : req.method,
      auth: req['auth'],
      user: req.user,
      requestId,
      request: req,
      response: res,
      __function_name: func.name,
    }
    const result = await func.invoke(ctx)

    if (result.error) {
      logger.error(
        requestId,
        `invoke function ${func_name} invoke error: `,
        result,
      )

      return res.status(400).send({
        error:
          'invoke cloud function got error, please check the function logs',
        requestId,
      })
    }

    logger.trace(
      requestId,
      `invoke function ${func_name} invoke success: `,
      result,
    )

    if (res.writableEnded === false) {
      return res.send(result.data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return res.status(500).send('Internal Server Error')
  }
}
