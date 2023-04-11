import { Response } from 'express'
import { FunctionContext } from '../support/function-engine'
import { logger } from '../support/logger'
import { CloudFunction } from '../support/function-engine'
import { IRequest } from '../support/types'
import { handleDebugFunction } from './debug-func'
import { parseToken } from '../support/token'
import { DEFAULT_FUNCTION_NAME, INTERCEPTOR_FUNCTION_NAME } from '../constants'

/**
 * Handler of invoking cloud function
 */
export async function handleInvokeFunction(req: IRequest, res: Response) {
  // intercept the request, skip websocket request
  if (false === req.method.startsWith('WebSocket:')) {
    const passed = await invokeInterceptor(req, res)
    if (passed === false) return
  }

  // debug mode
  if (req.get('x-laf-develop-token')) {
    return await handleDebugFunction(req, res)
  }

  // trigger mode
  let isTrigger = false
  if (parseToken(req.get('x-laf-trigger-token'))) {
    isTrigger = true
  }

  const requestId = req.requestId
  const func_name = req.params?.name

  // load function data from db
  let funcData = CloudFunction.getFunctionByName(func_name)
  if (!funcData) {
    // load default function from db
    funcData = CloudFunction.getFunctionByName(DEFAULT_FUNCTION_NAME)
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

async function invokeInterceptor(req: IRequest, res: Response) {
  const requestId = req.requestId
  const func_name = INTERCEPTOR_FUNCTION_NAME

  // load function data from db
  const funcData = CloudFunction.getFunctionByName(func_name)
  // pass if no interceptor
  if (!funcData) {
    return true
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
      user: req.user,
      requestId,
      request: req,
      response: res,
      __function_name: func.name,
    }
    const result = await func.invoke(ctx)

    // return false to reject request if interceptor got error
    if (result.error) {
      logger.error(
        requestId,
        `invoke function ${func_name} invoke error: `,
        result,
      )

      res.status(400).send({
        error: `invoke ${func_name} function got error, please check the function logs`,
        requestId,
      })

      return false
    }

    // if response has been ended, return false to stop the request
    if (res.writableEnded) {
      return false
    }

    // reject request if interceptor return false
    if (false === result.data) {
      res.status(403).send({ error: 'Forbidden', requestId })
      return false
    }

    // pass the request
    return result.data
  } catch (error) {
    logger.error(requestId, `failed to invoke ${func_name}`, error)
    return res
      .status(500)
      .send(`Internal Server Error - got error in ${func_name}`)
  }
}
