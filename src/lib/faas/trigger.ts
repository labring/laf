import { getLogger } from "../logger"
import { getCloudFunctionById, invokeFunction } from "./invoke"
import { db } from '../../lib/db'
import { now } from "../time"


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

  // Timer触发器的间隔
  public duration?: number

  // HTTP 触发器方法
  public method?: string = '*'

  // 上次执行时间
  public last_exec_time: number

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
    logger.trace('init trigger by fromJson: ', data)
    const tri = new Trigger()
    tri.type = data.type
    tri.desc = data.desc
    tri.id = data._id
    tri.func_id = data.func_id
    tri.name = data.name
    tri.last_exec_time = data.last_exec_time

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
  }

  public destroy() {
    this.cancelTimer()
  }

  /**
   * 触发事件
   * @param event 事件名
   * @param param 事件参数
   */
  public emit(event: string, param?: any) {
    logger.debug(`emit ${event} :`, param)

    // filter triggers by given eventName
    const triggers = this.getEventTriggers()
      .filter(tri => tri.event === event)

    // trigger the functions' execution
    for (const tri of triggers) {
      logger.debug(`emit() with event [${event}], executing function : ${tri.func_id}`)
      this.executeFunction(tri.func_id, param)
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
  private async executeFunction(func_id: string, param: any) {
    const func = await getCloudFunctionById(func_id)
    await invokeFunction(func, param)
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


    return r.data.map(data => Trigger.fromJson(data))
  }

  private getEventTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isEvent)
  }

  private getTimerTriggers(): Trigger[] {
    return this._triggers.filter(tri => tri.isTimer)
  }

  /**
   * 定时器触发器调度
   */
  private timerLoop() {
    const triggers = this.getTimerTriggers()

    // 遍历所有定时任务
    for (const tri of triggers) {

      // 判断任务执行时间是否已到
      if (now() - tri.last_exec_time >= tri.duration) {
        // 执行任务函数
        this.executeFunction(tri.func_id, null)

        // 更新最后执行时间
        tri.last_exec_time = now()
      }
    }
  }
}