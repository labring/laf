/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-03 00:58:59
 * @Description: 
 */

import { getFunctionById } from "../../api/function"
import { addFunctionLog, CloudFunctionLogStruct } from "../../api/function"
import { TriggerScheduler } from "cloud-function-engine"
import { createLogger } from "../logger"
import assert = require("assert")
import { ObjectId } from "bson"
import { WebSocket } from "ws"
import { IncomingMessage } from "http"
import { CloudFunction } from "../function"


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
   * Trigger an websocket event
   * @param event the event name
   * @param data the params for function
   */
  public websocketEmit(event: string, data: any, socket: WebSocket, request?: IncomingMessage) {

    // filter triggers by given eventName
    const triggers = this.getEventTriggers()
      .filter(tri => tri.event === event)

    // trigger the functions' execution
    for (const tri of triggers) {
      const param: any = {
        params: data,
        method: event,
        requestId: `trigger_${tri.id}`,
        socket,
        headers: request?.headers
      }
      this.executeFunction(tri.func_id, param, tri)
    }
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