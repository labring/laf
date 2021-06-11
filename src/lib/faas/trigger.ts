import { getLogger } from "../logger"
import { getCloudFunctionById, invokeFunction } from "./invoke"
import { db, accessor } from '../../lib/db'
import { now } from "../utils/time"
import { FunctionContext } from "./types"
import { convertActionType } from "../utils/util"


const logger = getLogger('trigger')

// 触发器类型
enum TriggerType {
  TRIGGER_EVENT = 'event',
  TRIGGER_TIMER = 'timer',
  TRIGGER_HTTP = 'http'
}

/**
 * 触发器
 */
export class Trigger {
  public id: string
  // 显示名称
  public name: string

  // 描述
  public desc: string

  // 触发器类型
  public type: TriggerType

  // 云函数ID
  public func_id: string

  // 事件触发器的事件名
  public event?: string

  // Timer触发器的间隔(秒)
  public duration?: number

  // HTTP 触发器方法
  public method?: string

  // 上次执行时间
  public last_exec_time: number

  // 状态
  public status: number

  get isEvent() {
    return this.type === TriggerType.TRIGGER_EVENT
  }

  get isTimer() {
    return this.type === TriggerType.TRIGGER_TIMER
  }

  get isHTTP() {
    return this.type === TriggerType.TRIGGER_HTTP
  }

  static fromJson(data: any): Trigger {
    logger.debug('init trigger by fromJson: ', data)
    const tri = new Trigger()
    tri.type = data.type
    tri.desc = data.desc
    tri.id = data._id
    tri.func_id = data.func_id
    tri.name = data.name
    tri.last_exec_time = data.last_exec_time ?? 0
    tri.status = data.status

    if (tri.isEvent) {
      tri.event = data.event
    }

    if (tri.isTimer) {
      tri.duration = data.duration
    }

    if (tri.isHTTP) {
      tri.method = data.method
    }

    return tri
  }
}


/**
 * 触发器管理
 * 触发器类型：event, timer, http
 */
export class TriggerScheduler {
  private _triggers: Trigger[] = []
  private _timer = null

  public async init() {
    logger.debug('init trigger scheduler')
    this._triggers = await this.loadTriggers()

    this.scheduleTimer()

    this.emit('triggers.init')
  }

  public destroy() {
    this.cancelTimer()
  }

  /**
   * 更新指定 trigger：
   *  1. 从库中获取最新 trigger 数据
   *  2. 若 status 为停用，则从当前调度表中删除
   *  3. 若 status 为启用，则将其最新数据更新或添加到当前调度列表中
   * @param triggerId 
   */
  public async updateTrigger(trigger: Trigger): Promise<boolean> {
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
   * 获取 HTTP 触发器
   * @returns 
   */
  public getHttpTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isHTTP)
  }


  /**
   * 执行云函数
   * @param func_id 
   * @param param 
   */
  private async executeFunction(func_id: string, param: FunctionContext, trigger: Trigger) {
    const func = await getCloudFunctionById(func_id)
    const result = await invokeFunction(func, param)

    // 将云函数调用日志存储到数据库
    {

      result.logs.unshift(`invoked by trigger: ${trigger.name} (${trigger.id})`)
      await db.collection('function_logs')
        .add({
          requestId: `trigger_${trigger.id}`,
          func_id: func._id,
          func_name: func.name,
          logs: result.logs,
          time_usage: result.time_usage,
          created_at: Date.now(),
          updated_at: Date.now(),
          created_by: `trigger_${trigger.id}`,
          trigger_id: trigger.id
        })
    }
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

  /**
   * 加载所有可用触发器
   * @returns 
   */
  private async loadTriggers(): Promise<Trigger[]> {
    const r = await db.collection('triggers')
      .where({ status: 1 })
      .get()


    logger.debug('loadTriggers: ', r.data)
    return r.data.map(data => Trigger.fromJson(data))
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


// 触发器的调度器单例
export const scheduler = new TriggerScheduler()

// 当数据库连接成功时，初始化 scheduler
accessor.ready.then(() => {
  scheduler.init()
})

accessor.on('result', AccessorEventCallBack)

/**
 * 数据操作事件回调
 * @param data 
 */
export function AccessorEventCallBack(data: any) {
  const { params, result } = data

  const op = convertActionType(params.action)

  // 忽略的数据事件
  if (['read', 'count', 'watch'].includes(op)) {
    return
  }

  // 触发数据事件
  const event = `/db/${params.collection}#${op}`
  scheduler.emit(event, result)
}