/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-09-03 19:14:10
 * @Description: 
 */

import * as express from 'express'
import { parseToken, splitBearerToken } from './utils/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './router/index'
import { logger } from './lib/logger'

const server = express()
server.use(express.json() as any)

/**
 * Allow CORS by default
 */
server.all('*', function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
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


process.on('uncaughtException', function (err) {
  logger.error(err.stack)
})