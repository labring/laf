import { CONFIG_COLLECTION } from '../constants'
import { DatabaseAgent } from '../db'

import { logger } from './logger'

export class DatabaseChangeStream {
  static async initialize() {
    this.watchConf()
  }

  /**
   * stream the change of cloud function
   * @param
   * @returns
   */
  static async watchConf() {
    logger.info('Listening for changes in conf collection...')
    this.updateEnvironments()

    const stream = DatabaseAgent.db.collection(CONFIG_COLLECTION).watch()

    stream.on('change', async (_change) => {
      this.updateEnvironments()
    })

    stream.on('close', () => { 
      logger.info('Conf collection change stream closed.')
      setTimeout(() => { 
        logger.info('Reconnecting conf collection change stream...')
        this.watchConf()
      }, 3000)
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
