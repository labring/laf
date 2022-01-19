import Config from "../../config"
import { logger } from "../logger"
import { DockerContainerServiceDriver } from "./container"
import { ServiceDriverInterface } from "./interface"
import { KubernetesServiceDriver } from "./kubernetes"

/**
 * Service driver to manage app services
 */
export class ServiceDriver {
  static get driver(): string {
    return Config.SERVICE_DRIVER || 'docker'
  }
  static create(): ServiceDriverInterface {
    logger.info("creating ServiceDriver with driver: " + this.driver)
    if (this.driver === 'kubernetes') {
      return new KubernetesServiceDriver()
    } else {
      return new DockerContainerServiceDriver()
    }
  }
}