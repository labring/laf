import {logger} from "./support/logger";
import Config from "./config";
import {DatabaseAgent} from "./support/db";

import {getRoutesInStatus, RouteStatus, updateRouteStatus} from "./support/route";
import {GatewayOperator} from "./support/gateway-operator";

export function start_scheduler() {
  logger.info('start scheduler loop')
  setInterval(loop, Config.SCHEDULER_INTERVAL)
}

function loop() {
  if (!DatabaseAgent.db) {
    return logger.info('waiting for db connected...')
  }
  const tick = new Date()
  handle_prepared_create(tick)
  handle_prepared_delete(tick)

}

async function handle_prepared_create(tick: any) {
  const routes = await getRoutesInStatus(RouteStatus.PREPARED_CREATE)
  for (let route of routes) {
    try {
      let res = await GatewayOperator.create(route)
      console.log(res)
      if (res) {
        logger.info(tick, `update ${route.appid} status from 'PREPARED_CREATE'  to 'CREATED'`)
        await updateRouteStatus(route.appid, route.status, RouteStatus.CREATED)
      }
    } catch (error) {
      logger.error(tick, `handle_prepared_create(${route.appid}) error: `, error)
    }
  }
}

async function handle_prepared_delete(tick: any) {
  const routes = await getRoutesInStatus(RouteStatus.PREPARED_DELETE)
  for (let route of routes) {
    try {
      let res = await GatewayOperator.delete(route)
      if (res) {
        logger.info(tick, `update ${route.appid} status from 'PREPARED_DELETE'  to 'DELETED'`)
        await updateRouteStatus(route.appid, route.status, RouteStatus.DELETED)
      }
    } catch (error) {
      logger.error(tick, `handle_prepared_delete(${route.appid}) error: `, error)
    }
  }
}