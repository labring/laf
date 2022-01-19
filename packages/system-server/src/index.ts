/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-19 15:57:56
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './utils/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './router/index'
import { logger } from './lib/logger'
import { DatabaseAgent } from './lib/db-agent'
import { ServiceDriver } from './lib/service-driver'
import { Constants } from './constants'

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
  await ServiceDriver.create().removeService({ appid: Constants.SYSTEM_EXTENSION_APPID } as any)
  await DatabaseAgent.sys_accessor.close()
  server.close(async () => {
    logger.info('process gracefully exited!')
  })
}