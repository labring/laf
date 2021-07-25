import { getFunctionByName } from "../api/function"
import { CloudFunction } from "../lib/faas/function"
import { FunctionContext } from "../lib/faas/types"


/**
 * 在云函数中调用云函数，此函数运行于云函数中
 * @param name 函数名
 * @param param 函数运行参数
 * @returns 
 */
export async function invokeInFunction(name: string, param: FunctionContext) {
  const data = await getFunctionByName(name)
  const func = new CloudFunction(data)

  if (!func) {
    throw new Error(`invoke() failed to get function: ${name}`)
  }

  if(!func.compiledCode) {
    func.compile2js()
  }

  param = param ?? {}
  
  if(param.requestId) {
    param.requestId = this.param.requestId
  }

  if (param.method) {
    param.method = param.method ?? 'call'
  }

  const result = await func.invoke(param)

  return result
}