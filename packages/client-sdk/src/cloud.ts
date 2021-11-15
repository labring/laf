
import { Db } from 'database-ql'
import { Request } from './request/request'
import { UniRequest } from './request/request-uni'
import { WxmpRequest } from './request/request-wxmp'
import { CloudOptions, EnvironmentType, RequestInterface, UploadFile } from './types'


/**
 * Cloud 提供 `LaF` 应用的客户端操作接口：
 * - 数据库操作
 * - 云函数调用
 * - 文件上传
 */
class Cloud {
  private config: CloudOptions

  /**
   * 文件上传、下载基地址
   */
  get fileBaseUrl(): string {
    return this.config.baseUrl + '/file'
  }

  /**
   * 云函数调用基地址
   */
  get funcBaseUrl(): string {
    return this.config.baseUrl + '/func'
  }

  /**
   * 根据配置获取请求类
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
   * 请求对象
   */
  protected _request: RequestInterface

  constructor(config: CloudOptions) {
    const warningFunc = () => {
      console.warn('WARNING: no getAccessToken set for db proxy request')
      return ""
    }

    const db_proxy_url = this.resolveDbProxyUrl(config)

    this.config = {
      baseUrl: config.baseUrl,
      dbProxyUrl: db_proxy_url,
      entryUrl: db_proxy_url,
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
   * 获取数据库操作对象
   * @returns 
   */
  database() {
    return new Db({
      request: this._request,
      primaryKey: this.config?.primaryKey
    })
  }

  /**
   * 调用云函数
   */
  async invokeFunction<T = any>(functionName: string, data: any): Promise<T> {
    const url = this.funcBaseUrl + `/${functionName}`
    const res = await this
      ._request
      .request(url, data)

    return res.data
  }

  /**
   * 上传文件
   * @deprecated 此函数已弃用，请通过文件上传地址，自行实现上传
   * @param file 文件对象(File)
   * @param bucket Bucket 名字
   * @param auto_naming 文件名是否由服务端自动生成，默认为 1（自动生成），0（保留原文件名）
   * @returns 
   */
  async uploadFile(file: UploadFile, bucket: string, auto_naming = 1) {
    const auto = auto_naming ? 1 : 0
    const res = await this
      ._request
      .upload({
        url: this.fileBaseUrl + `/${bucket}?auto=${auto}`,
        files: [file]
      })

    return res.data
  }

  /**
   * 为了兼容 less-api 老版本用法，处理 db proxy url 为绝对路径
   * @param options 
   * @returns 
   */
  private resolveDbProxyUrl(options: CloudOptions) {
    if (options.entryUrl) {
      console.warn('DEPRECATED: `entryUrl` is deprecated in future, use `dbProxyUrl` instead')
    }

    const _url = options.dbProxyUrl ?? options.entryUrl
    if (!_url) {
      throw new Error('db proxy url should not be empty')
    }

    if (_url.startsWith('/') && options.baseUrl) {
      return options.baseUrl + _url
    }

    return _url
  }
}

export {
  Cloud,
  Db,
  Request
}
