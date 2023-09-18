import Config from "../../config"
import { DatabaseAgent } from "../../db"
import { logger } from "../logger"


export class DatabaseChangeStream {
  static collectionName: string
  static async onStreamChange(change: any) {
  }

  static async initialize() {
    const stream = DatabaseAgent.db.collection(this.collectionName).watch()

    stream.on('change', this.onStreamChange)

    stream.once('close', () => {
      stream.off('change',this.onStreamChange)
      logger.error(`${this.collectionName} collection change stream closed.`)

      setTimeout(() => {
        logger.info(`Reconnecting ${this.collectionName} collection change stream...`)
        this.initialize()
      }, Config.CHANGE_STREAM_RECONNECT_INTERVAL)
    })
  }
}
