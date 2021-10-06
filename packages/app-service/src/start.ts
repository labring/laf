/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-08-16 15:55:37
 * @LastEditTime: 2021-10-06 21:55:22
 * @Description: 
 * The start script entry: manage service process by cluster process mode, restart service process while error occurred.
 * You can also run service directly by launching `index.ts`.
 */

import { Worker } from 'cluster'
import { createLogger } from './lib/logger'
import * as fs from 'fs'
import { join } from 'path'
import { debounce } from 'lodash'
import { execSync } from 'child_process'
const cluster = require('cluster')


if (cluster.isPrimary) {
  const logger = createLogger('primary')
  logger.info(`Primary ${process.pid} is running`)
  let worker: Worker = null

  const forkServer = debounce(() => {
    worker = cluster.fork()
  }, 1000)

  forkServer()

  /**
   * start service process while ones dead
   */
  cluster.on('exit', (worker: Worker, code: number, signal: number) => {
    logger.info(`worker ${worker.process.pid} died with code ${code}, signal ${signal}`)
    forkServer()
  })

  /**
   * watch package.json, restart service process when new package installed  
   */
  fs.watch(join(__dirname, '../package.json'))
    .on('change', (type, filename) => {
      logger.info(type, filename)

      // create internal package since npm had cleaned the internal package `@/cloud-sdk` after `npm install` running
      const ret = execSync("npm run create-internal-pkg")
      logger.info(ret.toString())

      // kill worker to reload packages
      if (worker) {
        logger.info(`worker ${worker.process.pid} would be killed`)
        worker.kill()
      }
    })
} else {
  // run the app server
  require('./index')
}