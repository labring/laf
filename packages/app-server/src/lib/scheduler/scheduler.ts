
import { getFunctionById } from "../../api/function"
import { addFunctionLog } from "../../api/function-log"
import { CloudFunction, TriggerScheduler } from "cloud-function-engine"
import { createLogger } from "../logger"
import assert = require("assert")


const logger = createLogger('scheduler')

/**
 * 派生类，实现其获取云函数数据的方法
 */
export class FrameworkScheduler extends TriggerScheduler {

  /**
   * 加载云函数，派生类需要实现此方法
   * @override
   * @param func_id 
   * @returns 
   */
  async getFunctionById(func_id: string): Promise<CloudFunction> {
    assert(func_id)
    const funcData = await getFunctionById(func_id)
    assert.ok(funcData, `failed to get function data: ${func_id}`)

    const func = new CloudFunction(funcData)
    if (!func.compiledCode) {
      logger.warn(`performance warning: function (${func_id} hadn't been compiled, will be compiled automatically)`)
      func.compile2js()
    }
    return func
  }

  /**
   * 该方法父类会调用，重写以记录函数执行日志
   * @override
   * @param data 
   */
  async addFunctionLog(data: any) {
    await addFunctionLog(data)
  }

  /**
   * 重写以处理调试日志
   * @override
   * @param params 
   */
  async log(...params: any[]) {
    logger.debug(...params)
  }
}