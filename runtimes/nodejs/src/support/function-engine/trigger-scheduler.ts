import { logger } from '../logger'

import { FunctionContext } from "./types"
import { CloudFunction } from "./function"
import { Trigger } from "./trigger"
import assert = require('node:assert')
import WebSocket = require('ws')
import { IncomingMessage } from 'node:http'
import { addFunctionLog } from '../function-log'
import { ObjectId } from 'mongodb'


export class TriggerScheduler {
  private _triggers: Trigger[] = []
  private _timer = null

  public init(triggers: Trigger[]) {
    logger.info('init trigger scheduler')

    this._triggers = triggers.filter(tri => tri.isEnabled)

    this.scheduleTimer()

    this.emit('triggers.init')
  }

  public destroy() {
    this.cancelTimer()
    this._triggers = []
  }

  /**
   * Update or add a trigger to the scheduler
   * - if status is disabled, remove it from the scheduler
   * - if status is enabled, update or add it to the scheduler
   */
  public updateTrigger(trigger: Trigger): boolean {
    // remove it if it's disabled
    if (!trigger.isEnabled) {
      return this.removeTrigger(trigger.id)
    }

    // enabled: update or add
    const index = this._triggers.findIndex(tri => tri.id === trigger.id)
    if (index < 0) {
      this._triggers.push(trigger)
    } else {
      if (trigger.isTimer) {
        trigger.last_exec_time = this._triggers[index].last_exec_time ?? 0
      }

      this._triggers[index] = trigger
    }

    return true
  }

  /**
   * Emit event
   */
  public emit(event: string, data?: any) {
    logger.debug(`trigger scheduler emit: ${event}`)

    // filter triggers by given eventName
    const triggers = this.getEventTriggers()
      .filter(tri => tri.event === event)

    // trigger the functions' execution
    for (const tri of triggers) {
      logger.debug(`trigger scheduler emit ${event} - executing function : ${tri.func_id}`)
      const param: FunctionContext = {
        params: data,
        method: 'trigger',
        requestId: `trigger_${tri.id}`
      }
      this.executeFunction(tri.func_id, param, tri)
    }
  }

  /**
   * Get function by id
   */
  protected async getFunctionById(func_id: string): Promise<CloudFunction> {
    assert(func_id)
    const funcData = await CloudFunction.getFunctionById(func_id)
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
   * Execute function
   */
  protected async executeFunction(func_id: string, param: FunctionContext, trigger: Trigger) {
    const func = await this.getFunctionById(func_id)
    const result = await func.invoke(param)

    // save function log
    result.logs.unshift(`invoked by trigger: ${trigger.name} (${trigger.id})`)
    await addFunctionLog({
      requestId: `trigger_${trigger.id}`,
      method: param.method,
      func_id: new ObjectId(func_id),
      func_name: func.name,
      logs: result.logs,
      time_usage: result.time_usage,
      created_by: `trigger_${trigger.id}`,
      trigger_id: trigger.id
    })
  }

  /**
   * start timer schedule
   */
  protected scheduleTimer() {
    this.cancelTimer()
    this._timer = setInterval(this.timerLoop.bind(this), 1000)
  }

  /**
   * cancel timer schedule
   */
  protected cancelTimer() {
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  protected getEventTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isEvent)
  }

  protected getTimerTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isTimer)
  }

  protected removeTrigger(triggerId: string): boolean {
    const index = this._triggers.findIndex(t => t.id === triggerId)
    if (index === -1) {
      return false
    }

    this._triggers.splice(index, 1)
    return true
  }

  /**
   * timer loop
   */
  protected timerLoop() {
    const triggers = this.getTimerTriggers()

    // process all timers
    for (const tri of triggers) {
      // check if the time is up
      if (Date.now() - tri.last_exec_time >= tri.duration * 1000) {
        logger.debug(`trigger scheduler timer loop - ${tri.id}- executing function : ${tri.func_id}`)
        const param: FunctionContext = {
          params: tri,
          method: 'trigger',
          requestId: `trigger_${tri.id}`
        }
        // execute function
        this.executeFunction(tri.func_id, param, tri)

        // update last exec time
        tri.last_exec_time = Date.now()
      }
    }
  }
}