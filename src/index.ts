import * as express from 'express'
import { parseToken } from './lib/utils/token'
import { router } from './router/index'
import { v4 as uuidv4 } from 'uuid'
import { getLogger } from './lib/logger'
import Config from './config'

const logger = getLogger('server')
const server = express()
server.use(express.json())

// 服务端开放跨域
server.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  req['requestId'] = uuidv4()
  next()
})

// 解析 Bearer Token
server.use(function (req, _res, next) {
  const bearer = req.headers['authorization'] ?? ''
  const splitted = bearer.split(' ')
  const token = splitted.length === 2 ? splitted[1] : ''
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] || uuidv4()
  logger.info(`[${requestId}] ${req.path} start request`)
  logger.debug(`[${requestId}] auth: ` + JSON.stringify(auth))
  next()
})

server.use(router)

server.listen(Config.PORT, () => console.log(`listened on ${Config.PORT}`))