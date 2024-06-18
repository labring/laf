import { CONFIG_COLLECTION } from '../../constants'
import { DatabaseAgent } from '../../db'
import { DatabaseChangeStream } from '.'
// import {
//   installDependencies,
//   uninstallDependencies,
// } from '../module-hot-reload'

export class ConfChangeStream {
  static dependencies = []

  static initialize() {
    this.updateConfig(true)

    DatabaseChangeStream.onStreamChange(CONFIG_COLLECTION, () =>
      this.updateConfig(false),
    )
  }

  private static async updateConfig(init = false) {
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

    if (init) {
      ConfChangeStream.dependencies = conf.dependencies
      return
    }

    /*
    hot reload dependencies
    */

    // const newDeps = []
    // const unneededDeps = []

    // for (const dep of conf.dependencies) {
    //   if (!ConfChangeStream.dependencies.includes(dep)) {
    //     newDeps.push(dep)
    //   }
    // }

    // for (const dep of ConfChangeStream.dependencies) {
    //   if (!conf.dependencies.includes(dep)) {
    //     unneededDeps.push(dep)
    //   }
    // }

    // ConfChangeStream.dependencies = conf.dependencies

    // if (newDeps.length > 0) {
    //   installDependencies(newDeps)
    // }
    // if (unneededDeps.length > 0) {
    //   uninstallDependencies(unneededDeps)
    // }
  }
}
