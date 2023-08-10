import express from 'express'
import { DatabaseAgent } from './db'
import Config from './config'
import { logger } from './logger'
import addFunctionLog from './handler/add-function-log'
import getFunctionLog from './handler/get-function-log'

require('express-async-errors')
const app = express()

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Caught unhandledRejection:', reason, promise)
})
process.on('uncaughtException', (err) => {
  logger.error('Caught uncaughtException:', err)
})

app.use(express.json({ limit: Config.REQUEST_PAYLOAD_LIMIT }))
app.use(
  express.urlencoded({
    limit: Config.REQUEST_PAYLOAD_LIMIT,
    extended: true,
  }),
)

app.post('/function/log', addFunctionLog)
app.get('/function/log', getFunctionLog)
app.get('/healthz', (_, res) => res.send('ok'))

// @ts-ignore
app.use((err, req, res, next) => {
  logger.error('Caught error:', err)
  res.status(500).send('Internal Server Error')
})

const server = app.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`),
)

process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  await DatabaseAgent.accessor.close()
  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}
