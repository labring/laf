import { CONFIG_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'
import { DatabaseChangeStream } from '.'

export class ConfChangeStream {
  static initialize() {
    this.updateEnvironments()

    DatabaseChangeStream.onStreamChange(
      CONFIG_COLLECTION,
      this.updateEnvironments,
    )
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
