/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-08-18 16:36:54
 * @Description: 
 */

import { getTriggers } from "../../api/trigger"
import { Trigger } from "cloud-function-engine"
import { DatabaseAgent } from "../database"
import { createLogger } from "../logger"
import { convertActionType } from "../utils"
import { ChangeStreamDocument } from "mongodb"
import { FrameworkScheduler } from "./scheduler"
import { debounce } from 'lodash'
import { applyPolicyRules } from "../../api/rules"
import { Constants } from "../../constants"

const accessor = DatabaseAgent.accessor
const logger = createLogger('scheduler')

/**
 * Single instance of trigger scheduler
 */
export const SchedulerInstance = new FrameworkScheduler()

/**
 * Initialize scheduler while db connection is ready
 */
accessor.ready.then(async () => {
  // initialize triggers
  const data = await getTriggers()
  logger.trace('loadTriggers: ', data)
  const triggers = data.map(data => Trigger.fromJson(data))
  SchedulerInstance.init(triggers)
  SchedulerInstance.emit('App:ready')
  logger.info('triggers loaded')

  // initialize policies
  await applyPolicyRules()
  logger.info('policy rules applied')

  // watch database operation event through `WatchStream` of mongodb
  const db = accessor.db
  const stream = db.watch([], { fullDocument: 'updateLookup' })
  stream.on("change", (doc) => {
    DatabaseChangeEventCallBack(doc)
  })
})

// debounce function `applyPolicyRules`
const debouncedApplyPolicy = debounce(() => {
  applyPolicyRules()
    .then(() => logger.info('hot update: policy rules applied'))
    .catch(err => logger.error('hot update: policy rules applied failed: ', err))
}, 2000, { trailing: true, leading: false })

/**
 * Callback function for database change event
 * @param doc 
 */
function DatabaseChangeEventCallBack(doc: ChangeStreamDocument) {
  const operationType = doc.operationType
  const collection = doc.ns.coll

  // apply policies while policies changed
  if (collection === Constants.policy_collection && ['insert', 'update', 'delete', 'replace'].includes(operationType)) {
    debouncedApplyPolicy()
  }

  // update triggers while triggers changed
  if (collection === Constants.trigger_collection) {
    if (['insert', 'update', 'replace'].includes(operationType)) {
      const trigger = Trigger.fromJson(doc.fullDocument)
      SchedulerInstance.updateTrigger(trigger)
    }

    if (operationType === 'delete') {
      getTriggers()
        .then(data => {
          const triggers = data.map(it => Trigger.fromJson(it))
          SchedulerInstance.init(triggers)
        })
        .catch(err => logger.error(err))
    }
  }

  // ignore database changes of internal collections
  if (collection.startsWith('__')) {
    return
  }

  // emit database change event
  const event = `DatabaseChange:${collection}#${operationType}`
  SchedulerInstance.emit(event, doc)
}


/**
 * Implement database change event mechanism by listening accessor event. (!Deprecated)
 * @deprecated This method would be removed in future, use mongodb WatchStream instead.
 * @tip Keep this part of the code temporarily for compatibility with older applications
 * 
 * This mechanism has the following characteristics (compared with the mechanism of mongodb WatchStream): 
 *  - Not limited to Mongodb
 *  - In addition to update and delete events, you can listen for read and count events
 *  - Cannot listen for data changes that are not operated by accessor
 *  - The update and remove operation cannot obtain the id of the affected data.
 *  - Data changes that occur during an unexpected outage of the service cannot be monitored 
 *    (whereas the mongodb WatchStream mechanism can be monitored for changes during recovery from an outage)
 */
accessor.on('result', AccessorEventCallBack)

/**
 * Callback for database operation event
 * @param data 
 */
export function AccessorEventCallBack(data: any) {
  // fix the type problem of mongodb _id, transform possibly ObjectIds to string type
  const _data = JSON.parse(JSON.stringify(data))

  const { params, result } = _data

  const op = convertActionType(params.action)

  // ignored operations
  if (['read', 'count', 'watch'].includes(op)) {
    return
  }

  // ignore operations on internal collections
  if (params.collection?.startsWith('__')) {
    return
  }

  // emit database operation event
  const event = `/db/${params.collection}#${op}`
  SchedulerInstance.emit(event, {
    exec_params: params,
    exec_result: result
  })
}