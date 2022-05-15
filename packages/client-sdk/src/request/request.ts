import axios from 'axios'
import { CloudOptions, EnvironmentType, RequestInterface } from '../types'

/**
 * 默认使用 axios 发送请求，可支持浏览器 和 Node.js 环境，如需支持其它平台，请派生子类并重写 `send()` 方法
 */
export class Request implements RequestInterface {
  protected options: CloudOptions
  constructor(options: CloudOptions) {
    this.options = Object.assign({}, options)
    this.options.timeout = options?.timeout || 15000
  }


  /**
   * 发送 less-api 数据操作请求, 由 `Db` 中调用
   * @param action 
   * @param data 
   * @returns 
   */
  async send(action: string, data: object) {
    const params = Object.assign({}, data, {
      action
    })

    const slowQueryWarning = setTimeout(() => {
      console.warn(
        'Database operation is longer than 3s. Please check query performance and your network environment.'
      )
    }, 3000)

    try {
      const req_url = this.options.baseUrl + this.options.dbProxyUrl
      const res = await this.request(req_url, params)
      return res.data
    } finally {
      clearTimeout(slowQueryWarning)
    }
  }


  /**
   * 发出 HTTP 请求，主要于 `less-api` 数据请求和 `less-framework` 云函数调用时使用
   * 默认使用 axios 发送请求，可支持浏览器 和 Node.js 环境，如需支持其它平台，请派生子类并重写本方法
   * @param data 
   * @returns 
   */
  async request(url: string, data: any): Promise<any> {
    if (this.options.environment !== EnvironmentType.H5) {
      throw new Error('environment type must be h5')
    }

    const token = this.options.getAccessToken()
    const headers = this.getHeaders(token)

    const res = await axios
      .post(url, data, {
        headers,
        timeout: this.options.timeout,
      })

    return res
  }

  /**
   * 获取必要的请求头
   * @param token 
   * @returns 
   */
  protected getHeaders(token: string, headers?: Object) {
    headers = headers ?? { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const optionHeader = this.options?.headers || {}
    return Object.assign(headers, optionHeader)
  }
}