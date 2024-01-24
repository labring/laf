import { CONFIG_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'
import { DatabaseChangeStream } from '.'
import { installDependencies, uninstallDependencies } from '../utils'

export class ConfChangeStream {
  static dependencies = []

  static initialize() {
    this.updateEnvironments(true)

    DatabaseChangeStream.onStreamChange(
      CONFIG_COLLECTION,
      this.updateEnvironments,
    )
  }

  private static async updateEnvironments(init = false) {
    const conf = await DatabaseAgent.db
      .collection(CONFIG_COLLECTION)
      .findOne({})

    if (!conf) {
      return
    }

    ConfChangeStream.dependencies = conf.dependencies

    if (init) {
      return
    }

    const newDeps = []
    const unneededDeps = []

    for (const dep of conf.dependencies) {
      if (!ConfChangeStream.dependencies.includes(dep)) {
        newDeps.push(dep)
      }
    }

    for (const dep of ConfChangeStream.dependencies) {
      if (!conf.dependencies.includes(dep)) {
        unneededDeps.push(dep)
      }
    }

    if (newDeps.length > 0) {
      installDependencies(newDeps)
    }
    if (unneededDeps.length > 0) {
      uninstallDependencies(unneededDeps)
    }
  }
}
