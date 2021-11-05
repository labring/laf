import { getFunctionByName } from "../api/function"
import { FunctionContext } from "cloud-function-engine"
import { addFunctionLog } from "../api/function-log"
import { CloudFunction } from "../lib/function"


/**
 * 在云函数中调用云函数，此函数运行于云函数中
 * @param name 函数名
 * @param param 函数运行参数
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