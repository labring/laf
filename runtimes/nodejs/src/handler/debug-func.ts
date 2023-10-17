import { FunctionContext } from '../support/function-engine'
import { logger } from '../support/logger'
import { CloudFunction } from '../support/function-engine'
import { parseToken } from '../support/token'
import { ICloudFunctionData } from '@lafjs/cloud'

/**
 * Handler of debugging cloud function
 */
export async function handleDebugFunction(ctx: FunctionContext) {
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
  const func_str = ctx.request.get('x-laf-func-data')
  if (!func_str) {
    return ctx.response.status(400).send('x-laf-func-data is required')
  }

  // parse func_data
  let func_data: ICloudFunctionData
  try {
    const decoded = decodeURIComponent(func_str)
    func_data = JSON.parse(decoded)
  } catch (error) {
    return ctx.response.status(400).send('x-laf-func-data is invalid')
  }

  const requestId = ctx.requestId
  const func_name = ctx.request.params?.name

  if (!func_data) {
    return ctx.response.send({
      code: 1,
      error: 'function data not found',
      requestId,
    })
  }

  const func = new CloudFunction(func_data)

  try {
    // execute the func
    ctx.__function_name = func_name
    const result = await func.invoke(ctx)

    if (result.error) {
      logger.error(requestId, `debug function ${func_name} error: `, result)
      return ctx.response.send({
        error: 'invoke function got error: ' + result.error.toString(),
        time_usage: result.time_usage,
        requestId,
      })
    }

    logger.trace(requestId, `invoke ${func_name} invoke success: `, result)

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
