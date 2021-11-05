/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-05 14:46:49
 * @Description: 
 */

import { getFunctionById } from "../../api/function"
import { addFunctionLog, CloudFunctionLogStruct } from "../../api/function-log"
import { CloudFunction, TriggerScheduler } from "cloud-function-engine"
import { createLogger } from "../logger"
import assert = require("assert")
import { ObjectId } from "bson"


const logger = createLogger('scheduler')

/**
 * FrameworkScheduler derived from TriggerScheduler
 * Override the getting-cloud-function method
 */
export class FrameworkScheduler extends TriggerScheduler {

  /**
   * Load cloud function by id
   * @override
   * @param func_id 
   * @returns 
   */
  async getFunctionById(func_id: string): Promise<CloudFunction> {
    assert(func_id)
    const funcData = await getFunctionById(func_id)
    assert.ok(funcData, `failed to get function data: ${func_id}`)

    const func = new CloudFunction(funcData)
    assert.ok(func.compiledCode, `func.compiledCode got empty: ${func_id}`)
    return func
  }

  /**
   * Will be called by TriggerScheduler
   * @override
   * @param data 
   */
  async addFunctionLog(data: CloudFunctionLogStruct) {
    // func_id from TriggerScheduler is string type, convert it to ObjectId
    data.func_id = new ObjectId(data.func_id)
    await addFunctionLog(data)
  }

  /**
   * Process with internal logs in TriggerScheduler 
   * @override
   * @param params 
   */
  async log(...params: any[]) {
    logger.trace(...params)
  }
}