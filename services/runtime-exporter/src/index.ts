import express, { Request, Response, NextFunction } from 'express'
import Config from './config'
import { logger } from './logger'
import getRuntimeMetrics from './handler/get-runtime-metrics'

require('express-async-errors')
const app = express()

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Caught unhandledRejection:', reason, promise)
})
process.on('uncaughtException', (err: Error) => {
  logger.error('Caught uncaughtException:', err)
})

app.get('/runtime/metrics:token', getRuntimeMetrics)
app.get('/healthz', (_, res: Response) => res.send('ok'))

// express error capture middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Caught error:', err)
  res.status(500).send('Internal Server Error')
})

const server = app.listen(Config.PORT, () =>
  logger.info(`server ${process.pid} listened on ${Config.PORT}`),
)

process.on('SIGTERM', gracefullyExit)
process.on('SIGINT', gracefullyExit)

async function gracefullyExit() {
  server.close(async () => {
    logger.info('process gracefully exited!')
    process.exit(0)
  })
}
