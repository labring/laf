import { getLogger } from "log4js"
import { getTriggers } from "../api/trigger"
import { accessor } from "./db"
import { TriggerScheduler } from "./faas"
import { Trigger } from "./faas/trigger"
import { convertActionType } from "./utils"

const logger = getLogger('scheduler')

// 触发器的调度器单例
export const scheduler = new TriggerScheduler()

// 当数据库连接成功时，初始化 scheduler
accessor.ready.then(async () => {
  const data = await getTriggers()

  logger.debug('loadTriggers: ', data)

  const triggers = data.map(data => Trigger.fromJson(data))
  scheduler.init(triggers)

  scheduler.emit('app.ready')
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
  scheduler.emit(event, {
    exec_params: params,
    exec_result: result
  })
}