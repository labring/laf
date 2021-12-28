/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-12-28 10:18:03
 * @Description: 
 */

import { getTriggers } from "../../api/trigger"
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
  const triggers = await getTriggers()
  logger.debug('loadTriggers: ', triggers)
  SchedulerInstance.init(triggers)
  logger.info('triggers loaded')

  // initialize policies
  await applyPolicyRules()
  logger.info('policy rules applied')

  // watch database operation event through `WatchStream` of mongodb
  const db = accessor.db

  function startWatchChangeStream() {
    logger.info('start watching change stream')
    const stream = db.watch([], { fullDocument: 'updateLookup' })
    stream.on("change", (doc) => { DatabaseChangeEventCallBack(doc) })
    stream.on('error', (err) => {
      logger.error('stream watch error: ', err)
      setTimeout(() => {
        logger.info('restart watching change stream...')
        startWatchChangeStream()
      }, 3000)
    })
    process.on('SIGINT', () => stream.close())
    process.on('SIGTERM', () => stream.close())
  }

  startWatchChangeStream()

  // emit `App:ready` event
  SchedulerInstance.emit('App:ready')
})

/**
 * debounce function `applyPolicyRules`
 */
const debouncedApplyPolicies = debounce(() => {
  applyPolicyRules()
    .then(() => logger.info('hot update: policy rules applied'))
    .catch(err => logger.error('hot update: policy rules applied failed: ', err))
}, 1000, { trailing: true, leading: false })

/**
 * debounce function of apply triggers
 */
const debouncedApplyTriggers = debounce(() => {
  getTriggers()
    .then(data => SchedulerInstance.init(data))
    .catch(err => logger.error('hot update: triggers applied failed', err))
}, 1000, { trailing: true, leading: false })

/**
 * Callback function for database change event
 * @param doc 
 */
function DatabaseChangeEventCallBack(doc: ChangeStreamDocument) {
  const operationType = doc.operationType
  const collection = doc.ns.coll

  // apply policies while policies changed
  if (collection === Constants.policy_collection && ['insert', 'update', 'delete', 'replace'].includes(operationType)) {
    debouncedApplyPolicies()
  }

  // update triggers while functions changed
  if (collection === Constants.function_collection) {
    debouncedApplyTriggers()
  }

  // ignore database changes of internal collections
  if (collection.startsWith('__')) {
    return
  }

  // emit database change event
  const event = `DatabaseChange:${collection}#${operationType}`
  SchedulerInstance.emit(event, doc)
  logger.debug(`scheduler emit database change event: ${event}`)
}