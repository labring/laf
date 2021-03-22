import { LoggerInterface } from 'less-api'
import * as log4js from 'log4js'
import Config from '../config'


export function getLogger(category: string, level?: string): LoggerInterface {
  const logger = log4js.getLogger(category)
  logger.level = level ?? Config.LOG_LEVEL

  return logger as any
}