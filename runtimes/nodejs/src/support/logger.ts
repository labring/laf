/*
 * @Author: Maslow<wangfugen@126.com>
 * @Date: 2021-07-30 10:30:29
 * @LastEditTime: 2021-10-06 19:26:58
 * @Description:
 */

import { LoggerInterface } from 'database-proxy'
import * as log4js from 'log4js'
import Config from '../config'

/**
 * Create logger instance
 * @param category log category
 * @param level the logger level : 'fatal', 'error', 'warning', 'info', 'debug', 'trace'
 * @returns
 */
export function createLogger(
  category: string,
  level?: string,
): LoggerInterface {
  const logger = log4js.getLogger(category)
  logger.level = level ?? Config.LOG_LEVEL

  return logger as any
}

/**
 * The global logger instance
 */
export const logger = createLogger('server')
