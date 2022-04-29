import Config from "./config"
import { getApplicationsInStatus, InstanceStatus, updateApplicationStatus } from "./support/application"
import { ApplicationInstanceOperator } from "./support/instance-operator"
import { logger } from "./support/logger"


export async function start_schedular() {
  setInterval(loop, Config.SCHEDULER_INTERVAL)
}
function loop() {
  const tick = new Date()
  logger.info('enter loop ' + tick)

  handle_prepared_start(tick)
  handle_starting(tick)
  handle_prepared_stop(tick)
  handle_prepared_stop(tick)
  handle_stopping(tick)
  handle_prepared_restart(tick)
  handle_restarting_stopping(tick)
}


async function handle_prepared_start(tick: Date) {
  logger.info('processing `prepared_start` status with tick: ', tick)
  const apps = await getApplicationsInStatus(InstanceStatus.PREPARED_START)
  for (let app of apps) {
    try {
      const res = await ApplicationInstanceOperator.start(app)
      if (res) await updateApplicationStatus(app.appid, app.status, InstanceStatus.STARTING)
    } catch (error) {
      logger.error(`handle_prepared_start got error for app ${app.appid} with tick: ${tick}`)
    }
  }
}

async function handle_starting(tick: Date) {
  logger.info('processing `starting` status with tick: ', tick)
  const apps = await getApplicationsInStatus(InstanceStatus.STARTING)
  for (let app of apps) {
    try {
      // const res = await ApplicationInstanceOperator.start(app)
      // if (res) await updateApplicationStatus(app.appid, app.status, InstanceStatus.STARTING)
    } catch (error) {
      logger.error(`handle_starting got error for app ${app.appid} with tick: ${tick}`)
    }
  }
}

async function handle_prepared_stop(tick: Date) {
  logger.info('processing `prepared_stop` status with tick: ', tick)
}


async function handle_stopping(tick: Date) {
  logger.info('processing `stopping` status with tick: ', tick)
}


async function handle_prepared_restart(tick: Date) {
  logger.info('processing `prepared_restart` status with tick: ', tick)
}

async function handle_restarting_stopping(tick: Date) {
  logger.info('processing `restarting:stopping` status with tick: ', tick)
}