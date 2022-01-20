
import * as express from "express"
import Config from "./config"
import { DatabaseAgent } from "./lib/database"
import { logger } from "./lib/logger"
import { generateUUID } from "./lib/utils"
import { router } from "./router"

const app = express()

app.all('*', function (req, res, next) {
  const requestId = req['requestId'] = generateUUID()
  res.header('X-Powered-By', 'LaF Server')
  res.header('REQUEST-ID', requestId)
  logger.info(requestId, `${req.method} "${req.url}" - referer: ${req.get('referer') || '-'} ${req.get('user-agent')}`)
  next()
})

app.use(express.json() as any)
app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(router)

const server = app.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`)
)

process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  await DatabaseAgent.conn.close()
  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Caught unhandledRejection:`, reason, promise)
})

process.on('uncaughtException', err => {
  logger.error(`Caught uncaughtException:`, err)
})