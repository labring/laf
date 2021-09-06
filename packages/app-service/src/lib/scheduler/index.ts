/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-06 00:27:44
 * @Description: 
 */

import { getTriggers } from "../../api/trigger"
import { Trigger } from "cloud-function-engine"
import { DatabaseAgent } from "../database"
import { createLogger } from "../logger"
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