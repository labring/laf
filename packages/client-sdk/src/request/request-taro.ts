import { Request } from './request'
import { CloudOptions, EnvironmentType } from '../types'

interface GlobalObjectType {
  request: any
  uploadFile: any
}
declare const taro: GlobalObjectType

/**
 * Taro 环境请求类
 */
export class TaroRequest extends Request {
  constructor(config: CloudOptions) {
    super(config)
  }

  /**
   * Taro 环境请求方法
   * @override
   * @param data
   * @returns
   */
  async request(url: string, data: any, _options?: any) {
    if (this.options.environment !== EnvironmentType.TARO) {
      throw new Error('environment type must be taro')
    }

    const token = this.options.getAccessToken()
    const header = this.getHeaders(token)
    const options = {
      url,
      header,
      method: _options?.method ?? 'POST',
      data,
      dataType: 'json',
    }

    const res = await taro.request(options)
    return res
  }
}
