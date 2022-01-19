import { Constants } from "../constants"
import { DatabaseAgent } from "../lib/db-agent"
import { ServiceDriver } from "../lib/service-driver"
import { ApplicationStruct } from "./application"


export class ApplicationService {
  /**
   * start app service
   * @param app 
   * @returns 
   */
  static async start(app: ApplicationStruct) {
    const db = DatabaseAgent.db
    const driver = ServiceDriver.create()
    const res = await driver.startService(app)

    await db.collection(Constants.cn.applications)
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
    const driver = ServiceDriver.create()
    const res = await driver.removeService(app)

    await db.collection(Constants.cn.applications)
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
}