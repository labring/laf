import { addFunctionLog, getFunctionByName } from "../api/function"
import { FunctionContext } from "cloud-function-engine"
import { CloudFunction } from "../lib/function"


/**
 * The cloud function is invoked in the cloud function, which runs in the cloud function.
 * 
 * @param name the name of cloud function to be invoked
 * @param param the invoke params
 * @returns 
 */
export async function invokeInFunction(name: string, param?: FunctionContext) {
  const data = await getFunctionByName(name)
  const func = new CloudFunction(data)

  if (!func) {
    throw new Error(`invoke() failed to get function: ${name}`)
  }

  param = param ?? {}

  param.requestId = param.requestId ?? 'invoke'

  param.method = param.method ?? 'call'

  const result = await func.invoke(param)

  await addFunctionLog({
    requestId: param.requestId,
    method: param.method,
    func_id: func.id,
    func_name: name,
    logs: result.logs,
    time_usage: result.time_usage,
    data: result.data,
    error: result.error,
  })

  if (result.error) {
    throw result.error
  }

  return result.data
}