
import { Request } from './request'
import { CloudOptions, EnvironmentType } from '../types'

interface GlobalObjectType {
  request: any
  uploadFile: any
}
declare const uni: GlobalObjectType

/**
 * Uni-app 环境请求类
 */
export class UniRequest extends Request {
  constructor(config: CloudOptions) {
    super(config)
  }

  /**
   * uni-app 环境请求方法
   * @override
   * @param data 
   * @returns 
   */
  async request(url: string, data: any, _options?: any) {
    if (this.options.environment !== EnvironmentType.UNI_APP) {
      throw new Error('environment type must be uniapp')
    }

    const token = this.options.getAccessToken()
    const header = this.getHeaders(token)
    const options = {
      url,
      header,
      method: _options?.method ?? 'POST',
      data,
      dataType: 'json'
    }

    const res = await uni.request(options)
    return res
  }
}