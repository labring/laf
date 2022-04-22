import { CN_APPLICATIONS } from "../constants"
import { DatabaseAgent } from "../db"
import { IApplicationData } from "./application"
import { logger } from "./logger"
import Config from "../config"
import { KubernetesServiceDriver } from "./service-kubernetes-driver"
import { DockerContainerServiceDriver } from "./service-docker-driver"


export class ApplicationServiceOperator {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  static async start(app: IApplicationData) {
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
  static async stop(app: IApplicationData) {
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
  static async restart(app: IApplicationData) {
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


export interface ServiceDriverInterface {

  /**
   * Start application service
   * @param app 
   * @returns
   */
  startService(app: IApplicationData): Promise<any>

  /**
   * Remove application service
   * @param app 
   */
  removeService(app: IApplicationData): Promise<any>

  /**
   * Get service info
   * @param container 
   * @returns return null if container not exists
   */
  info(app: IApplicationData): Promise<any>


  /**
   * Get name of service
   * @param app 
   */
  getName(app: IApplicationData): string
}