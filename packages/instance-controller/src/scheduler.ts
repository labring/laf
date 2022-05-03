import Config from "./config"
import { getApplicationsInStatus, InstanceStatus, updateApplicationStatus } from "./support/application"
import { DatabaseAgent } from "./support/db"
import { InstanceOperator } from "./support/instance-operator"
import { logger } from "./support/logger"


export function start_schedular() {
  logger.info('start schedular loop')
  setInterval(loop, Config.SCHEDULER_INTERVAL)
}

function loop() {
  if (!DatabaseAgent.db) {
    return logger.info('waiting for db connected...')
  }
  const tick = new Date()
  handle_prepared_start(tick)
  handle_starting(tick)
  handle_prepared_stop(tick)
  handle_prepared_stop(tick)
  handle_stopping(tick)
  handle_prepared_restart(tick)
  handle_restarting(tick)
}


async function handle_prepared_start(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.PREPARED_START)
  for (let app of apps) {
    try {
      const res = await InstanceOperator.start(app)
      if (res) {
        logger.info(tick, `update ${app.appid} status from 'PREPARED_START'  to 'STARTING'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.STARTING)
      }
    } catch (error) {
      logger.error(tick, `handle_prepared_start(${app.appid}) error: `, error)
    }
  }
}

async function handle_starting(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.STARTING)
  for (let app of apps) {
    try {
      const status = await InstanceOperator.status(app)
      if (status === InstanceStatus.RUNNING) {
        logger.info(tick, `update ${app.appid} status from 'STARTING'  to 'RUNNING'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.RUNNING)
      }
    } catch (error) {
      logger.error(tick, `handle_starting(${app.appid}) error: `, error)
    }
  }
}

async function handle_prepared_stop(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.PREPARED_STOP)
  for (let app of apps) {
    try {
      const res = await InstanceOperator.stop(app)
      if (res) {
        logger.info(tick, `update ${app.appid} status from 'PREPARED_STOP'  to 'STOPPING'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.STOPPING)
      }
    } catch (error) {
      logger.error(tick, `handle_prepared_stop(${app.appid}) error: `, error)
    }
  }
}


async function handle_stopping(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.STOPPING)
  for (let app of apps) {
    try {
      const status = await InstanceOperator.status(app)
      if (status === InstanceStatus.STOPPED) {
        logger.info(tick, `update ${app.appid} status from 'STOPPING'  to 'STOPPED'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.STOPPED)
      }
    } catch (error) {
      logger.error(tick, `handle_stopping(${app.appid}) error: `, error)
    }
  }
}


async function handle_prepared_restart(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.PREPARED_RESTART)
  for (let app of apps) {
    try {
      const res = await InstanceOperator.stop(app)
      if (res) {
        logger.info(tick, `update ${app.appid} status from 'PREPARED_RESTART'  to 'RESTARTING'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.RESTARTING)
      }
    } catch (error) {
      logger.error(tick, `handle_prepared_restart(${app.appid}) error: `, error)
    }
  }
}

async function handle_restarting(tick: any) {
  const apps = await getApplicationsInStatus(InstanceStatus.RESTARTING)
  for (let app of apps) {
    try {
      const status = await InstanceOperator.status(app)
      if (status !== InstanceStatus.STOPPED) continue

      logger.info(tick, `start stopped ${app.appid} for restarting`)
      const res = await InstanceOperator.start(app)
      if (res) {
        logger.info(tick, `update ${app.appid} status from 'RESTARTING'  to 'STARTING'`)
        await updateApplicationStatus(app.appid, app.status, InstanceStatus.STARTING)
      }
    } catch (error) {
      logger.error(tick, `handle_stopping(${app.appid}) error: `, error)
    }
  }
}