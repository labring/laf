/**
 *
 */

import * as express from "express"
import Config from "./config"
import { logger } from "./lib/logger"
import { router } from "./router"

const server = express()
server.use(express.json() as any)
server.use(
  express.urlencoded({
    extended: true,
  }) as any
)

/**
 * Allow CORS by default
 */
server.all("*", function (_req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type")
  res.header("Access-Control-Allow-Methods", "*")
  res.header("X-Powered-By", "LaF Server")
  next()
})

server.use(router)

server.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`)
)
