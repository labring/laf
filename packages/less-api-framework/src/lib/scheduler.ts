
import { getFunctionById } from "../api/function"
import { addFunctionLog } from "../api/function-log"
import { getTriggers } from "../api/trigger"
import { CloudFunction, Trigger, TriggerScheduler } from "cloud-function"
import { Globals } from "./globals"
import { createLogger } from "./logger"
import { convertActionType } from "./utils"

const accessor = Globals.accessor
const logger = createLogger('scheduler')

/**
 * 派生类，实现其获取云函数数据的方法
 */
class FrameworkScheduler extends TriggerScheduler {

  /**
   * 加载云函数，派生类需要实现此方法
   * @override
   * @param func_id 
   * @returns 
   */
  async getFunctionById(func_id: string): Promise<CloudFunction>{
    const funcData = await getFunctionById(func_id)
    return new CloudFunction(funcData)
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



// 触发器的调度器单例
export const Scheduler = new FrameworkScheduler()

// 当数据库连接成功时，初始化 scheduler
accessor.ready.then(async () => {
  const data = await getTriggers()

  logger.debug('loadTriggers: ', data)

  const triggers = data.map(data => Trigger.fromJson(data))
  Scheduler.init(triggers)

  Scheduler.emit('app.ready')
})

accessor.on('result', AccessorEventCallBack)

/**
 * 数据操作事件回调
 * @param data 
 */
export function AccessorEventCallBack(data: any) {
  // 解决 mongodb _id 对象字符串问题
  const _data = JSON.parse(JSON.stringify(data))
  
  const { params, result } = _data

  const op = convertActionType(params.action)

  // 忽略的数据事件
  if (['read', 'count', 'watch'].includes(op)) {
    return
  }

  // 触发数据事件
  const event = `/db/${params.collection}#${op}`
  Scheduler.emit(event, {
    exec_params: params,
    exec_result: result
  })
}