/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2022-01-20 13:55:22
 * @Description:
 */

import express from 'express'
import cors from 'cors'

import { parseToken, splitBearerToken } from './support/token'
import Config from './config'
import { router } from './handler/router'
import { logger } from './support/logger'
import { generateUUID } from './support/utils'
import { WebSocketAgent } from './support/ws'
import { DatabaseAgent } from './db'
import xmlparser from 'express-xml-bodyparser'

// init static method of class
import './support/cloud-sdk'
import { FunctionCache } from './support/function-engine/cache'
import { DatabaseChangeStream } from './support/db-change-stream'

const app = express()

DatabaseAgent.accessor.ready.then(() => {
  FunctionCache.initialize()
  DatabaseChangeStream.initialize()
})

if (process.env.NODE_ENV === 'development') {
  app.use(cors())
}

app.use(express.json({ limit: Config.REQUEST_LIMIT_SIZE }) as any)
app.use(
  express.urlencoded({
    limit: Config.REQUEST_LIMIT_SIZE,
    extended: true,
  }) as any,
)
app.use(
  express.raw({
    limit: Config.REQUEST_LIMIT_SIZE,
  }) as any,
)

app.use(xmlparser())

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', (err) => {
  logger.error(`Caught uncaughtException:`, err)
})

/**
 * Parsing bearer token
 */
app.use(function (req, res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['user'] = auth

  const requestId = (req['requestId'] =
    req.headers['x-request-id'] || generateUUID())
  if (req.url !== '/_/healthz') {
    logger.info(
      requestId,
      `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'
      } ${req.get('user-agent')}`,
    )
    logger.trace(requestId, `${req.method} ${req.url}`, {
      body: req.body,
      headers: req.headers,
      auth,
    })
  }
  res.set('request-id', requestId)
  next()
})

app.use(router)

const server = app.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`),
)

/**
 * WebSocket upgrade & connect
 */
server.on('upgrade', (req, socket, head) => {
  WebSocketAgent.server.handleUpgrade(req, socket as any, head, (client) => {
    WebSocketAgent.server.emit('connection', client, req)
  })
})

process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  await DatabaseAgent.accessor.close()
  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}
