

import { ApplicationStruct } from '../application'


export interface ServiceDriverInterface {

  /**
   * Start application service
   * @param app 
   * @returns
   */
  startService(app: ApplicationStruct): Promise<any>

  /**
   * Remove application service
   * @param app 
   */
  removeService(app: ApplicationStruct): Promise<any>

  /**
   * Get service info
   * @param container 
   * @returns return null if container not exists
   */
  info(app: ApplicationStruct): Promise<any>


  /**
   * Get name of service
   * @param app 
   */
  getName(app: ApplicationStruct): string
}