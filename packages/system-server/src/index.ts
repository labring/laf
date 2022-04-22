/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-01 22:55:54
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './support/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './handler/router'
import { logger } from './logger'
import { DatabaseAgent } from './db'
import { SYSTEM_EXTENSION_APPID } from './constants'
import { ApplicationServiceOperator } from './support/service-operator'

const app = express()
app.use(express.json({
  limit: '10000kb'
}) as any)


app.all('*', function (_req, res, next) {
  res.header('X-Powered-By', 'LaF Server')
  next()
})

/**
 * Parsing bearer token
 */
app.use(function (req, _res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = uuidv4()
  logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
  logger.trace(requestId, `${req.method} ${req.url}`, { body: req.body, headers: req.headers, auth })
  next()
})

app.use(router)

const server = app.listen(Config.PORT, () => logger.info(`listened on ${Config.PORT}`))


process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', err => {
  logger.error(`Caught uncaughtException:`, err)
})


process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {

  // NOT remove system extension app service if service driver is 'kubernetes', 
  if (Config.SERVICE_DRIVER === 'docker') {
    logger.info('exiting: removing system extension service')
    await ApplicationServiceOperator.create().removeService({ appid: SYSTEM_EXTENSION_APPID } as any)
    logger.info('exiting: system extension service has been removed')
  }

  logger.info('exiting: closing db connection')
  await DatabaseAgent.sys_accessor.close()
  logger.info('exiting: db connection has been closed')

  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}