import * as express from 'express'
import { parseToken, splitBearerToken } from './lib/utils/token'
import { v4 as uuidv4 } from 'uuid'
import Config from './config'
import { router } from './router/index'
import { Globals } from './lib/globals'
import { deployFunctions } from './api/function'
import { deployTriggers } from './api/trigger'

const logger = Globals.logger
const server = express()
server.use(express.json())

// 解析 Bearer Token
server.use(function (req, _res, next) {
  const token = splitBearerToken(req.headers['authorization'] ?? '')
  const auth = parseToken(token) || null
  req['auth'] = auth

  const requestId = req['requestId'] =  uuidv4()
  logger.info(`[${requestId}] ${req.path} start request`)
  logger.debug(`[${requestId}] auth: ` + JSON.stringify(auth))
  next()
})

server.use(router)

server.listen(Config.PORT, () => console.log(`listened on ${Config.PORT}`))




/**
 * 监听云函数、触发器变化 & 部署
 */
 {
  const acc = Globals.sys_accessor
    acc.ready.then(() => {
      acc.db
        .watch([], { fullDocument: 'updateLookup' })
        .on('change', doc => {
          const coll = doc.ns.coll
          if(coll === '__functions') {
            deployFunctions()
          }

          if(coll === '__triggers') {
            deployTriggers()
          }
        })
    })
}
  