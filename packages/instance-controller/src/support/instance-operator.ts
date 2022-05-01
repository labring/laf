
import { IApplicationData, InstanceStatus } from "./application"
import Config from "../config"
import { KubernetesDriver } from "./instance-kubernetes-driver"
import { DockerContainerDriver } from "./instance-docker-driver"

/**
 * Application instance operator
 */
export class InstanceOperator {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  public static async start(app: IApplicationData) {
    return await this.driver().create(app)
  }

  /**
   * stop app service
   * @param app 
   * @returns 
   */
  public static async stop(app: IApplicationData) {
    return await this.driver().remove(app)
  }

  public static async status(app: IApplicationData) {
    return await this.driver().status(app)
  }

  private static driver(): InstanceDriverInterface {
    const driver = Config.SERVICE_DRIVER || 'docker'
    if (driver === 'kubernetes') {
      return new KubernetesDriver()
    } else {
      return new DockerContainerDriver()
    }
  }
}


export interface InstanceDriverInterface {

  /**
   * Start application instance
   * @param app 
   * @returns
   */
  create(app: IApplicationData): Promise<boolean>

  /**
   * Remove application instance
   * @param app 
   */
  remove(app: IApplicationData): Promise<boolean>

  /**
   * Get instance information
   * @returns return null if container not exists
   */
  inspect(app: IApplicationData): Promise<any>

  /**
   * Get instance status
   * @param app 
   */
  status(app: IApplicationData): Promise<InstanceStatus>

  /**
   * Get name of service
   * @param app 
   */
  getName(app: IApplicationData): string
}