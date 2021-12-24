import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { DockerContainerServiceDriver } from "../lib/service-driver/container"
import { ApplicationStruct } from "./application"


export class ApplicationService {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  static async start(app: ApplicationStruct) {
    const db = DatabaseAgent.db
    const dockerService = new DockerContainerServiceDriver()
    const container_id = await dockerService.startService(app)

    await db.collection(Constants.cn.applications)
      .updateOne(
        { appid: app.appid },
        {
          $set: { status: 'running' }
        })

    return container_id
  }

  /**
   * stop app service
   * @param app 
   * @returns 
   */
  static async stop(app: ApplicationStruct) {
    const dockerService = new DockerContainerServiceDriver()
    const container_id = await dockerService.stopService(app)
    const db = DatabaseAgent.db

    await db.collection(Constants.cn.applications)
      .updateOne(
        { appid: app.appid },
        {
          $set: { status: 'stopped' }
        })

    return container_id
  }

  /**
   * remove app service
   * @param app 
   * @returns 
   */
  static async remove(app: ApplicationStruct) {
    const dockerService = new DockerContainerServiceDriver()
    const container_id = await dockerService.removeService(app)
    const db = DatabaseAgent.db

    await db.collection(Constants.cn.applications)
      .updateOne(
        { appid: app.appid },
        { $set: { status: 'cleared' } })

    return container_id
  }

  /**
   * restart app service
   * @param app 
   * @returns 
   */
  static async restart(app: ApplicationStruct) {
    await this.stop(app)
    const container_id = await this.start(app)
    return container_id
  }

  /**
   * if app is running
   * @param app 
   * @returns 
   */
  static async isRunning(app: ApplicationStruct) {
    const dockerService = new DockerContainerServiceDriver()
    const info = await dockerService.info(app)

    return info.State.Running
  }
}