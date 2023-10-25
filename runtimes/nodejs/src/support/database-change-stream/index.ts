import EventEmitter from 'events'
import { DatabaseAgent } from '../../db'
import { logger } from '../logger'
import Config from '../../config'
import {
  CLOUD_FUNCTION_COLLECTION,
  CONFIG_COLLECTION,
  WEBSITE_HOSTING_COLLECTION,
} from '../../constants'
import { ConfChangeStream } from './conf-change-stream'
import { WebsiteHostingChangeStream } from './website-hosting-change-stream'
import { FunctionCache } from '../engine'

const collectionsToWatch = [
  {
    name: CONFIG_COLLECTION,
    handler: () => ConfChangeStream,
  },
  {
    name: WEBSITE_HOSTING_COLLECTION,
    handler: () => WebsiteHostingChangeStream,
  },
  {
    name: CLOUD_FUNCTION_COLLECTION,
    handler: () => FunctionCache,
  },
] as const

export class DatabaseChangeStream extends EventEmitter {
  private static instance: DatabaseChangeStream

  private constructor() {
    super()
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DatabaseChangeStream()
    }
    return this.instance
  }

  initializeForCollection(collectionName: string) {
    const stream = DatabaseAgent.db.collection(collectionName).watch()

    stream.on('change', (change) => {
      this.emit(collectionName, change)
    })

    stream.once('close', () => {
      stream.off('change', this.emit)
      logger.error(`${collectionName} collection change stream closed.`)

      setTimeout(() => {
        logger.info(
          `Reconnecting ${collectionName} collection change stream...`,
        )
        this.initializeForCollection(collectionName)
      }, Config.CHANGE_STREAM_RECONNECT_INTERVAL)
    })
  }

  static initialize() {
    const instance = DatabaseChangeStream.getInstance()

    collectionsToWatch.forEach((v) => {
      instance.initializeForCollection(v.name)
      v.handler().initialize()
    })
  }

  static onStreamChange(
    collectionName: (typeof collectionsToWatch)[number]['name'],
    listener: (...args: any[]) => void,
  ) {
    const instance = DatabaseChangeStream.getInstance()
    instance.on(collectionName, listener)
  }

  static removeAllListeners() {
    const instance = DatabaseChangeStream.getInstance()
    instance.removeAllListeners()
  }
}
