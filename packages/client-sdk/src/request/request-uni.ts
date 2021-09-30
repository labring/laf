
import { Request } from './request'
import { UploadFileOption, CloudOptions, EnvironmentType } from '../types'

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
    if(this.options.environment !== EnvironmentType.UNI_APP) {
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

    const [err, res] = await uni.request(options)

    if (err) {
      throw err
    }
    return res
  }

  /**
   * 处理文件上传请求
   * @param {UploadFileOption} option 
   */
   async upload(option: UploadFileOption): Promise<any> {
    if(this.options.environment !== EnvironmentType.UNI_APP) {
      throw new Error('environment type must be uniapp')
    }
    
    if(!option.files?.length) {
      throw new Error('files cannot be empty')
    }

    const form = new FormData()
    option.files.forEach(file => form.append(file.name, file.file))

    const token = this.options?.getAccessToken()

    const headers = this.getHeaders(token, {})
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: option.url,
        files: option.files,
        header: headers,
        success: res => {
          resolve(res)
        },
        fail: error => {
          reject(error)
        }
      })
    })
  }
}