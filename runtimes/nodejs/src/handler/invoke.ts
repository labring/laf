import { Response } from 'express'
import { IRequest } from '../support/types'
import { DEFAULT_FUNCTION_NAME, INTERCEPTOR_FUNCTION_NAME } from '../constants'
import { parseToken } from '../support/token'
import { logger } from '../support/logger'
import {
  CloudFunction,
  FunctionCache,
  FunctionContext,
  ICloudFunctionData,
} from '../support/engine'

export async function handleInvokeFunction(req: IRequest, res: Response) {
  const ctx: FunctionContext = {
    requestId: req.requestId,
    query: req.query,
    files: req.files as any,
    body: req.body,
    headers: req.headers,
    method: req.method,
    auth: req['auth'],
    user: req.user,
    request: req,
    response: res,
  }

  let useInterceptor = true

  // intercept the request, skip websocket request
  if (true === req.method.startsWith('WebSocket:')) {
    useInterceptor = false
  }

  if (!FunctionCache.get(INTERCEPTOR_FUNCTION_NAME)) {
    useInterceptor = false
  }

  // debug mode
  if (req.get('x-laf-develop-token')) {
    return await invokeDebug(ctx, useInterceptor)
  }

  return await invokeFunction(ctx, useInterceptor)
}

// invoke cloud function
async function invokeFunction(
  ctx: FunctionContext,
  useInterceptor: boolean,
): Promise<any> {
  const requestId = ctx.requestId

  // trigger mode
  let isTrigger = false
  if (parseToken(ctx.request.get('x-laf-trigger-token'))) {
    isTrigger = true
  }

  let func = FunctionCache.getEngine(ctx.request.params?.name)
  if (!func) {
    func = FunctionCache.getEngine(DEFAULT_FUNCTION_NAME)
    if (!func) {
      return ctx.response.status(404).send('Function Not Found')
    }
  }
  // reject while no HTTP enabled
  if (
    !func.data.methods.includes(ctx.request.method.toUpperCase()) &&
    !isTrigger
  ) {
    return ctx.response.status(405).send('Method Not Allowed')
  }

  try {
    // execute the func
    ctx.__function_name = func.data.name
    const result = await func.execute(ctx, useInterceptor)

    // return false to reject request if interceptor got error
    if (result.error) {
      logger.error(
        requestId,
        `invoke function ${ctx.__function_name} invoke error: `,
        result,
      )

      ctx.response.status(400).send({
        error: `invoke ${ctx.__function_name} function got error, please check the function logs`,
        requestId,
      })
      return false
    }

    logger.trace(
      requestId,
      `invoke function ${ctx.__function_name} invoke success: `,
      result,
    )

    // return false to reject request if interceptor return false
    if (
      typeof result.data === 'object' &&
      result.data.__type__ === '__interceptor__' &&
      result.data.__res__ == false
    ) {
      ctx.response.status(403).send({ error: 'Forbidden', requestId })
      return false
    }

    if (ctx.response.writableEnded === false) {
      let data = result.data
      if (typeof result.data === 'number') {
        data = Number(result.data).toString()
      }
      return ctx.response.send(data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return ctx.response.status(500).send('Internal Server Error')
  }
}

// invoke debug function
async function invokeDebug(
  ctx: FunctionContext,
  useInterceptor: boolean,
): Promise<any> {
  // verify the debug token
  const token = ctx.request.get('x-laf-develop-token')
  if (!token) {
    return ctx.response.status(400).send('x-laf-develop-token is required')
  }

  const auth = parseToken(token) || null
  if (auth?.type !== 'develop') {
    return ctx.response
      .status(403)
      .send('permission denied: invalid develop token')
  }

  // get func_data from header
  const funcStr = ctx.request.get('x-laf-func-data')
  if (!funcStr) {
    return ctx.response.status(400).send('x-laf-func-data is required')
  }

  // parse func_data
  let funcData: ICloudFunctionData
  try {
    const decoded = decodeURIComponent(funcStr)
    funcData = JSON.parse(decoded)
  } catch (error) {
    return ctx.response.status(400).send('x-laf-func-data is invalid')
  }

  const requestId = ctx.requestId
  const funcName = ctx.request.params?.name

  if (!funcData) {
    return ctx.response.send({
      code: 1,
      error: 'function data not found',
      requestId,
    })
  }

  const func = new CloudFunction(funcData)

  try {
    // execute the func
    ctx.__function_name = funcName
    const result = await func.execute(ctx, useInterceptor)

    if (result.error) {
      logger.error(requestId, `debug function ${funcName} error: `, result)
      return ctx.response.send({
        error: 'invoke function got error: ' + result.error.toString(),
        time_usage: result.time_usage,
        requestId,
      })
    }

    logger.trace(requestId, `invoke ${funcName} invoke success: `, result)

    // return false to reject request if interceptor return false
    if (
      typeof result.data === 'object' &&
      result.data.__type__ === '__interceptor__' &&
      result.data.__res__ == false
    ) {
      ctx.response.status(403).send({ error: 'Forbidden', requestId })
      return false
    }

    if (ctx.response.writableEnded === false) {
      let data = result.data
      if (typeof result.data === 'number') {
        data = Number(result.data).toString()
      }
      return ctx.response.send(data)
    }
  } catch (error) {
    logger.error(requestId, 'failed to invoke error', error)
    return ctx.response.status(500).send('Internal Server Error')
  }
}
