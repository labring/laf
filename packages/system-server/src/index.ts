/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-11-15 16:00:03
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './utils/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './router/index'
import { logger } from './lib/logger'
import { createSystemCollectionIndexes } from './api/init'

const server = express()
server.use(express.json({
  limit: '10000kb'
}) as any)

createSystemCollectionIndexes()
  .then(() => {
    logger.info('system db indexes created')
  })

/**
 * Allow CORS by default
 */
server.all('*', function (_req, res, next) {
  res.header('X-Powered-By', 'LaF Server')
  next()
})

/**
 * Parsing bearer token
 */
server.use(function (req, _res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = uuidv4()
  logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
  logger.trace(requestId, `${req.method} ${req.url}`, { body: req.body, headers: req.headers, auth })
  next()
})

server.use(router)

server.listen(Config.PORT, () => logger.info(`listened on ${Config.PORT}`))


process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', err => {
  logger.error(`Caught uncaughtException:`, err)
})