
import * as express from "express"
import Config from "./config"
import { logger } from "./lib/logger"
import { router } from "./router"

const server = express()
server.use(express.json() as any)
server.use(
  express.urlencoded({
    extended: true
  })
)

server.use(router)

server.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`)
)

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', err => {
  logger.error(`Caught uncaughtException:`, err)
})