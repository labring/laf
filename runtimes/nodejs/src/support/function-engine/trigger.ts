
enum TriggerType {
  TRIGGER_EVENT = 'event',
  TRIGGER_TIMER = 'timer',
  TRIGGER_HTTP = 'http'
}

/**
 * class Trigger
 */
export class Trigger {
  public id: string

  public name: string

  public desc: string

  public type: TriggerType

  public func_id: string

  public event?: string

  public duration?: number

  // last execution time
  public last_exec_time: number

  // status: 0 | 1
  public status: number

  get isEnabled() {
    return this.status === 1
  }

  get isEvent() {
    return this.type === TriggerType.TRIGGER_EVENT
  }

  get isTimer() {
    return this.type === TriggerType.TRIGGER_TIMER
  }

  /**
   * load trigger from json
   * @param data 
   * @returns 
   */
  static fromJson(data: any): Trigger {
    const tri = new Trigger()
    tri.type = data.type
    tri.desc = data.desc
    tri.id = data._id.toString()
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

    return tri
  }
}