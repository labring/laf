import { CloudOptions, EnvironmentType } from '../types'
import { Request } from './request'

interface GlobalObjectType {
  request: any
  uploadFile: any
}
declare const wx: GlobalObjectType

/**
 * 微信小程序环境请求类
 */
export class WxmpRequest extends Request {

  constructor(config: CloudOptions) {
    super(config)
  }


  /**
   * 微信小程序环境请求方法
   * @override
   * @param data 
   * @returns 
   */
  async request(url: string, data: any, _options?: any) {
    if (this.options.environment !== EnvironmentType.WX_MP) {
      throw new Error('environment type must be wxmp')
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

    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success(res: any) {
          resolve(res)
        },
        fail(err: any) {
          reject(err)
        }
      })
    })
  }
}