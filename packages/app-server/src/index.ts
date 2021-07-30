import * as express from 'express'
import { parseToken, splitBearerToken } from './lib/utils/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './router/index'
import { Globals } from './lib/globals'

// 为了生成相应的声明文件
export * from './cloud-sdk'

const logger = Globals.logger
const server = express()
server.use(express.json())

// 服务端开放跨域
server.all('*', function (_req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// 解析 Bearer Token
server.use(function (req, _res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] = uuidv4()
  logger.info(`[${requestId}] ${req.path} start request`)
  logger.debug(`[${requestId}] auth: ` + JSON.stringify(auth))
  next()
})

server.use(router)

server.listen(Config.PORT, () => console.log(`listened on ${Config.PORT}`))