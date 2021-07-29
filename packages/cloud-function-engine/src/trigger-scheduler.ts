
import { now } from "./utils"
import { FunctionContext } from "./types"
import { CloudFunction } from "./function"
import { Trigger } from "./trigger"


/**
 * 触发器管理
 * 触发器类型：event, timer
 */
export class TriggerScheduler {
  private _triggers: Trigger[] = []
  private _timer = null

  public init(triggers: Trigger[]) {
    this.log('init trigger scheduler')

    this._triggers = triggers.filter(tri => tri.isEnabled)

    this.scheduleTimer()

    this.emit('triggers.init')
  }

  public destroy() {
    this.cancelTimer()
    this._triggers = []
  }

  /**
   * 更新或添加指定 trigger：
   *  1. 若 status 为停用，则从当前调度表中删除
   *  1. 若 status 为启用，则将其最新数据更新或添加到当前调度列表中
   * @param triggerId 
   */
  public updateTrigger(trigger: Trigger): boolean {
    // 停用状态，移除调度
    if (!trigger.isEnabled) {
      return this.removeTrigger(trigger.id)
    }

    // 启用状态，更新或添加
    const index = this._triggers.findIndex(tri => tri.id === trigger.id)
    if (index < 0) {
      this._triggers.push(trigger)
    } else {
      // 若为定时器，则保留其 `最近一次执行时间`
      if(trigger.isTimer) {
        trigger.last_exec_time = this._triggers[index].last_exec_time ?? 0
      }
      
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
    this.log(`TriggerScheduler.emit -> ${event}`)

    // filter triggers by given eventName
    const triggers = this.getEventTriggers()
      .filter(tri => tri.event === event)

    // trigger the functions' execution
    for (const tri of triggers) {
      this.log(`TriggerScheduler.emit -> ${event} - executing function : ${tri.func_id}`)
      const param: FunctionContext = {
        params: data,
        method: 'trigger',
        requestId: `trigger_${tri.id}`
      }
      this.executeFunction(tri.func_id, param, tri)
    }
  }

  /**
   * 加载函数数据
   * @tip 开发者应派生此类，并重写此函数
   * @param func_id 函数ID
   * @returns 
   */
  protected async getFunctionById(_func_id: string): Promise<CloudFunction>{
    throw new Error('not implemented, you should drive TriggerScheduler class and override getFunctionById() method')
  }

  /**
   * 执行云函数
   * @param func_id 
   * @param param 
   */
  protected async executeFunction(func_id: string, param: FunctionContext, trigger: Trigger) {
    const func = await this.getFunctionById(func_id)

    const result = await func.invoke(param)

    // 将云函数执行日志抛出
    result.logs.unshift(`invoked by trigger: ${trigger.name} (${trigger.id})`)
    await this.addFunctionLog({
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
   * 添加函数执行日志，派生类可实现此方法
   * @override
   * @param data 
   */
  protected async addFunctionLog(data: any) {
    this.log(data)
  }

  /**
   * 打印日志，派生类可重写此方法，实现自定义日志输出
   * @override
   * @param params 
   */
  protected log(...params: any[]) {
    console.log(...params)
  }

  /**
   * 开始调度定时触发器
   */
   protected scheduleTimer() {
    this.cancelTimer()
    this._timer = setInterval(this.timerLoop.bind(this), 1000)
  }

  /**
   * 取消定时触发器调度
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

  /**
   * 从当前调度列表中移除触发器
   * @param triggerId 
   * @returns 
   */
   protected removeTrigger(triggerId: string): boolean {
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
  protected timerLoop() {
    const triggers = this.getTimerTriggers()
    // 遍历所有定时任务
    for (const tri of triggers) {

      // 判断任务执行时间是否已到
      if (now() - tri.last_exec_time >= tri.duration * 1000) {
        this.log(`TriggerScheduler.timer-loop -> trigger(${tri.id})- executing function : ${tri.func_id}`)
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