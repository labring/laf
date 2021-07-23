
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