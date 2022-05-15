
import { Db } from 'database-ql'
import { Request } from './request/request'
import { UniRequest } from './request/request-uni'
import { WxmpRequest } from './request/request-wxmp'
import { CloudOptions, EnvironmentType, RequestInterface } from './types'


/**
 * class Cloud provide the interface to request cloud function and cloud database.
 */
class Cloud {
  private config: CloudOptions

  /**
   * request class by environment
   */
  private get requestClass() {
    const env = this.config?.environment
    let ret = Request
    if (this.config?.requestClass) {
      ret = this.config?.requestClass
    } else if (env === EnvironmentType.UNI_APP) {
      ret = UniRequest
    } else if (env === EnvironmentType.WX_MP) {
      ret = WxmpRequest
    } else {
      ret = Request
    }

    return ret
  }

  /**
   * internal request class
   */
  protected _request: RequestInterface

  /**
   * Create a cloud instance
   * @param config 
   */
  constructor(config: CloudOptions) {
    const warningFunc = () => {
      console.warn('WARNING: no getAccessToken set for db proxy request')
      return ""
    }

    this.config = {
      baseUrl: config.baseUrl,
      dbProxyUrl: config.dbProxyUrl,
      getAccessToken: config?.getAccessToken || warningFunc,
      environment: config?.environment || EnvironmentType.H5,
      primaryKey: config?.primaryKey,
      timeout: config?.timeout,
      headers: config?.headers,
      requestClass: config?.requestClass
    }

    const reqClass = this.requestClass
    this._request = new reqClass(this.config)
  }

  /**
   * Get a cloud database instance
   * @returns 
   */
  database() {
    return new Db({
      request: this._request,
      primaryKey: this.config?.primaryKey
    })
  }

  /**
   * Invoke cloud function by name use POST http method
   * @alias alias of `invoke()` for history reason
   * @param functionName 
   * @param data 
   * @returns 
   */
  async invokeFunction<T = any>(functionName: string, data: any): Promise<T> {
    const url = this.config.baseUrl + `/${functionName}`
    const res = await this
      ._request
      .request(url, data)

    return res.data
  }

  /**
   * Invoke cloud function by name use POST http method
   * @param functionName 
   * @param data 
   * @returns 
   */
  async invoke<T = any>(functionName: string, data: any): Promise<T> {
    return await this.invokeFunction(functionName, data)
  }
}

export {
  Cloud,
  Db,
  Request
}
