
import { IApplicationData } from "./application"
import { logger } from "./logger"
import Config from "../config"
import { KubernetesDriver } from "./instance-kubernetes-driver"
import { DockerContainerDriver } from "./instance-docker-driver"


export class ApplicationInstanceOperator {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  static async start(app: IApplicationData) {
    const driver = this.create()
    const res = await driver.startService(app)

    return res
  }

  /**
   * stop app service
   * @param app 
   * @returns 
   */
  static async stop(app: IApplicationData) {
    const driver = this.create()
    const res = await driver.removeService(app)
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

  static create(): InstanceDriverInterface {
    const driver = Config.SERVICE_DRIVER || 'docker'
    logger.info("creating ServiceDriver with driver: " + driver)
    if (driver === 'kubernetes') {
      return new KubernetesDriver()
    } else {
      return new DockerContainerDriver()
    }
  }

  /**
   * @todo
   */
  static status() {
    // to be done
  }
}


export interface InstanceDriverInterface {

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