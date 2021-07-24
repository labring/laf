import { createLogger } from "../logger"
import { now } from "../utils/time"
import { FunctionContext } from "./types"
import { CloudFunction } from "./function"
import { Trigger } from "./trigger"
import { addFunctionLog } from "../../api/function-log"
import { getFunctionById } from "../../api/function"


const logger = createLogger('trigger')


/**
 * 触发器管理
 * 触发器类型：event, timer
 */
export class TriggerScheduler {
  private _triggers: Trigger[] = []
  private _timer = null

  public init(triggers: Trigger[]) {
    logger.debug('init trigger scheduler')
    this._triggers = triggers

    this.scheduleTimer()

    this.emit('triggers.init')
  }

  public destroy() {
    this.cancelTimer()
    this._triggers = []
  }

  /**
   * 更新指定 trigger：
   *  1. 从库中获取最新 trigger 数据
   *  2. 若 status 为停用，则从当前调度表中删除
   *  3. 若 status 为启用，则将其最新数据更新或添加到当前调度列表中
   * @param triggerId 
   */
  public updateTrigger(trigger: Trigger): boolean {
    console.log(trigger)
    // 停用状态，移除调度
    if (trigger.status === 0) {
      return this.removeTrigger(trigger.id)
    }

    // 启用状态，更新或添加
    const index = this._triggers.findIndex(tri => tri.id === trigger.id)
    if (index < 0) {
      this._triggers.push(trigger)
    } else {
      this._triggers[index] = trigger
    }

    return true
  }

  /**
   * 触发事件
   * @param event 事件名
   * @param param 事件参数
   */
  public emit(event: string, data?: any) {
    logger.debug(`TriggerScheduler.emit -> ${event}`)

    // filter triggers by given eventName
    const triggers = this.getEventTriggers()
      .filter(tri => tri.event === event)

    // trigger the functions' execution
    for (const tri of triggers) {
      logger.debug(`TriggerScheduler.emit -> ${event} - executing function : ${tri.func_id}`)
      const param: FunctionContext = {
        params: data,
        method: 'trigger',
        requestId: `trigger_${tri.id}`
      }
      this.executeFunction(tri.func_id, param, tri)
    }
  }

  /**
   * 执行云函数
   * @param func_id 
   * @param param 
   */
  private async executeFunction(func_id: string, param: FunctionContext, trigger: Trigger) {

    const funcData = await getFunctionById(func_id)
    const func = new CloudFunction(funcData)

    const result = await func.invoke(param)

    // 将云函数调用日志存储到数据库
  
    result.logs.unshift(`invoked by trigger: ${trigger.name} (${trigger.id})`)
    await addFunctionLog({
      requestId: `trigger_${trigger.id}`,
      func_id: func.id,
      func_name: func.name,
      logs: result.logs,
      time_usage: result.time_usage,
      created_at: Date.now(),
      updated_at: Date.now(),
      created_by: `trigger_${trigger.id}`,
      trigger_id: trigger.id
    })
  }

  /**
   * 开始调度定时触发器
   */
  private scheduleTimer() {
    this.cancelTimer()
    this._timer = setInterval(this.timerLoop.bind(this), 1000)
  }

  /**
   * 取消定时触发器调度
   */
  private cancelTimer() {
    if (this._timer) {
      clearInterval(this._timer)
    }
  }

  private getEventTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isEvent)
  }

  private getTimerTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isTimer)
  }

  /**
   * 从当前调度列表中移除触发器
   * @param triggerId 
   * @returns 
   */
  private removeTrigger(triggerId: string): boolean {
    const index = this._triggers.findIndex(t => t.id === triggerId)
    if (index === -1) {
      return false
    }

    this._triggers.splice(index, 1)
    return true
  }

  /**
   * 定时器触发器调度
   */
  private timerLoop() {
    const triggers = this.getTimerTriggers()

    // 遍历所有定时任务
    for (const tri of triggers) {

      // 判断任务执行时间是否已到
      if (now() - tri.last_exec_time >= tri.duration * 1000) {
        logger.debug(`TriggerScheduler.timer-loop -> trigger(${tri.id})- executing function : ${tri.func_id}`)
        const param: FunctionContext = {
          params: tri,
          method: 'trigger',
          requestId: `trigger_${tri.id}`
        }
        // 执行任务函数
        this.executeFunction(tri.func_id, param, tri)

        // 更新最后执行时间
        tri.last_exec_time = now()
      }
    }
  }
}