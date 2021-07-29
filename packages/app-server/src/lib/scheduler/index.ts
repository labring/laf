
import { getTriggers } from "../../api/trigger"
import { Trigger } from "cloud-function-engine"
import { Globals } from "../globals"
import { createLogger } from "../logger"
import { convertActionType } from "../utils"
import { ChangeStreamDocument } from "mongodb"
import { FrameworkScheduler } from "./scheduler"
import { debounce } from 'lodash'
import { applyRules } from "../../api/rules"
import { Constants } from "../../constants"


const accessor = Globals.accessor
const logger = createLogger('scheduler')

/**
 * 触发器的调度器单例
 */
export const Scheduler = new FrameworkScheduler()

/**
 * 当数据库连接成功时，初始化 scheduler
 */
accessor.ready.then(async () => {
  // 初始化触发器
  const data = await getTriggers()
  logger.debug('loadTriggers: ', data)
  const triggers = data.map(data => Trigger.fromJson(data))
  Scheduler.init(triggers)
  Scheduler.emit('App:ready')

  // 监听数据操作事件
  const db = accessor.db
  const stream = db.watch([], { fullDocument: 'updateLookup' })
  stream.on("change", (doc) => {
    DatabaseChangeEventCallBack(doc)
  })
})

// 对应用访问策略的函数进行防抖动处理
const debouncedApplyPolicy = debounce(() => {
  applyRules()
    .then(() => logger.info('policy rules applied'))
    .catch(err => logger.error('policy rules applied failed: ', err))
}, 2000, { trailing: true, leading: false })

/**
 * 数据操作事件回调
 * @param doc 
 */
function DatabaseChangeEventCallBack(doc: ChangeStreamDocument) {
  const operationType = doc.operationType
  const collection = doc.ns.coll

  // 访问策略变更时，加载新的访问规则
  if (collection === Constants.policy_collection && operationType === 'insert') {
    debouncedApplyPolicy()
  }

  // 触发器配置变更时，更新调度器
  if (collection === Constants.trigger_collection) {
    if (['insert', 'update', 'replace'].includes(operationType)) {
      const trigger = Trigger.fromJson(doc.fullDocument)
      Scheduler.updateTrigger(trigger)
    }

    if (operationType === 'delete') {
      getTriggers()
        .then(data => {
          const triggers = data.map(it => Trigger.fromJson(it))
          Scheduler.init(triggers)
        })
        .catch(err => logger.error(err))
    }
  }

  if(collection.startsWith('__')) {
    return
  }

  // 触发数据变更事件
  const event = `DatabaseChange:${collection}#${operationType}`
  Scheduler.emit(event, doc)
}


/**
 * @deprecated 未来会去除此实现机制，采取 mongodb watch 机制代替
 * @tip 暂保留此部分代码，以兼容老应用
 * 
 * 以下为原数据事件实现机制：监听 Accessor 的数据操作事件
 * Accessor Event 机制实现有以下特点（相对于 mongodb watch 实现的机制）：
 *  - 不局限于 Mongodb 数据库
 *  - 除更新与删除事件外，可监听到 read 和 count 事件
 *  - 不能监听到不是通过 Accessor 操作的数据变化
 *  - update remove 操作不能获取受影响数据的标识（_id)
 *  - 在本服务因意外中止运行期间发生的数据变化无法监听到（而 mongodb watch 机制可以做到从中断中恢复期间的变化监听）
 */
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

  if(params.collection?.startsWith('__')) {
    return
  }

  // 触发数据事件
  const event = `/db/${params.collection}#${op}`
  Scheduler.emit(event, {
    exec_params: params,
    exec_result: result
  })
}