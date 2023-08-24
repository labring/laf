import Config from '../config'
import { CONFIG_COLLECTION } from '../constants'
import { DatabaseAgent } from '../db'

import { logger } from './logger'

export class DatabaseChangeStream {
  static async initialize() {
    DatabaseChangeStream.watchConf()
  }

  /**
   * stream the change of cloud function
   * @param
   * @returns
   */
  static async watchConf() {
    logger.info('Listening for changes in conf collection...')
    DatabaseChangeStream.updateEnvironments()

    let stream = DatabaseAgent.db.collection(CONFIG_COLLECTION).watch()

    const changeEvent = async (_change) => {
      DatabaseChangeStream.updateEnvironments()
    }

    stream.on('change', changeEvent)

    stream.once('close', () => {
      stream.off('change', changeEvent)
      logger.error('Conf collection change stream closed.')
      stream = null

      setTimeout(() => {
        logger.info('Reconnecting conf collection change stream...')
        DatabaseChangeStream.watchConf()
      }, Config.CHANGE_STREAM_RECONNECT_INTERVAL)
    })
  }

  private static async updateEnvironments() {
    const conf = await DatabaseAgent.db
      .collection(CONFIG_COLLECTION)
      .findOne({})

    if (!conf) {
      return
    }

    const environments = conf.environments || []
    for (const env of environments) {
      process.env[env.name] = env.value
    }
  }
}
