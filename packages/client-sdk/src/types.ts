import { RequestInterface as BaseRequestInterface } from 'database-ql'

export interface RequestInterface extends BaseRequestInterface {
  request(url: string, data: any, options?: any): Promise<any>
}


export enum EnvironmentType {
  H5 = 'h5',
  WX_MP = 'wxmp',
  UNI_APP = 'uniapp'
}

type GetAccessTokenFuncType = () => string


export interface CloudOptions {
  /**
   * `laf` 应用服务的地址，如： "https://APPID.lafyun.com"
   * @tip 后面 `不要` 以 `/` 结尾
   */
  baseUrl?: string

  /**
   * 数据库访问代理的入口地址， 如： `/proxy/app`，`/proxy/admin`
   */
  dbProxyUrl?: string,


  /**
   * 获取访问令牌的函数
   */
  getAccessToken?: GetAccessTokenFuncType,

  /**
   * 请求头
   */
  headers?: Object
  /**
   * 请求超时时间
   */
  timeout?: number

  /**
   * 执行环境，默认为浏览器和 Node.js 环境
   */
  environment?: EnvironmentType

  /**
   * 用户自定义请求类，默认此项为空，实际请求类由 `environment` 决定。
   * 如果使用了自定义请求类，则会忽略 `environment` 的值；
   * 自定义请求类需要 实现 `RequestInterface` 接口，一般建议直接继承 `class Request`，重写父类部分方法即可。
   * 
   * ```js
   * import { Request } from 'laf'
   * class MyRequest extends Request {
   *  async request(url, data) {
   *    const res = await super.request(url, data)
   *    // do your own logics
        return res
   *  }
   * }
   * ```
   */
  requestClass?: any

  /**
   * Mongodb 主键为 '_id', 使用 MySQL 时可将此键设为 id
   */
  primaryKey?: string
}



export interface UploadFileOption {
  /**
   * 开发者服务器 url
   */
  url: string
  /**
   * 文件类型，image/video/audio，仅支付宝小程序，且必填。
   * - image: 图像
   * - video: 视频
   * - audio: 音频
   */
  fileType?: 'image' | 'video' | 'audio'
  /**
   * 要上传的文件对象
   */
  file?: File
  /**
   * 要上传文件资源的路径
   */
  filePath?: string
  /**
   * 文件对应的 key , 开发者在服务器端通过这个 key 可以获取到文件二进制内容
   */
  name?: string
  /**
   * 需要上传的文件列表。
   */
  files?: UploadFile[]
  /**
   * HTTP 请求 Header, header 中不能设置 Referer
   */
  header?: any
  /**
   * HTTP 请求中其他额外的 form data
   */
  formData?: any
  /**
   * 超时时间，单位 ms
   */
  timeout?: number
}

export interface UploadFile {
  /**
   * multipart 提交时，表单的项目名，默认为 file，如果 name 不填或填的值相同，可能导致服务端读取文件时只能读取到一个文件。
   */
  name?: string
  /**
   * 要上传的文件对象
   */
  file?: File
  /**
   * 要上传文件资源的路径
   */
  uri?: string
}