/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-02-01 22:55:54
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './support/token'
import Config from './config'
import { router } from './handler/router'
import { logger } from './support/logger'
import { DatabaseAgent } from './db'
import { generateUUID } from './support/util-passwd'

process.on('unhandledRejection', (reason, promise) => { logger.error(`Caught unhandledRejection:`, reason, promise) })
process.on('uncaughtException', err => { logger.error(`Caught uncaughtException:`, err) })
process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

const app = express()
app.use(express.json({ limit: '10000kb' }) as any)

/**
 * Parsing bearer token
 */
app.use(function (req, res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = req.headers['x-request-id'] || generateUUID()
  if (req.url !== '/healthz') {
    logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
    logger.trace(requestId, `${req.method} ${req.url}`, { body: req.body, headers: req.headers, auth })
  }

  res.set('request-id', requestId)
  next()
})

app.use(router)
const server = app.listen(Config.PORT, () => logger.info(`listened on ${Config.PORT}`))


async function gracefullyExit() {
  logger.info('exiting: closing db connection')
  await DatabaseAgent.sys_accessor.close()

  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}