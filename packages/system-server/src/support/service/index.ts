import { CN_APPLICATIONS } from "../../constants"
import { DatabaseAgent } from "../../db"
import { ApplicationStruct } from "../application"
import { ServiceDriverInterface } from "./interface"
import { logger } from "../../logger"
import Config from "../../config"
import { KubernetesServiceDriver } from "./kubernetes"
import { DockerContainerServiceDriver } from "./docker"


export class ApplicationService {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  static async start(app: ApplicationStruct) {
    const db = DatabaseAgent.db
    const driver = this.create()
    const res = await driver.startService(app)

    await db.collection(CN_APPLICATIONS)
      .updateOne(
        { appid: app.appid },
        {
          $set: { status: 'running' }
        })

    return res
  }

  /**
   * stop app service
   * @param app 
   * @returns 
   */
  static async stop(app: ApplicationStruct) {
    const db = DatabaseAgent.db
    const driver = this.create()
    const res = await driver.removeService(app)

    await db.collection(CN_APPLICATIONS)
      .updateOne(
        { appid: app.appid },
        {
          $set: { status: 'stopped' }
        })

    return res
  }

  /**
   * restart app service
   * @param app 
   * @returns 
   */
  static async restart(app: ApplicationStruct) {
    await this.stop(app)
    return await this.start(app)
  }

  static create(): ServiceDriverInterface {
    const driver = Config.SERVICE_DRIVER || 'docker'
    logger.info("creating ServiceDriver with driver: " + driver)
    if (driver === 'kubernetes') {
      return new KubernetesServiceDriver()
    } else {
      return new DockerContainerServiceDriver()
    }
  }
}