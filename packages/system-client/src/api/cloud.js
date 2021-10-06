import { getToken } from '@/utils/auth'
import { Message } from 'element-ui'
import { Cloud, Request } from 'laf-client-sdk'

/**
 * 自定义请求类
 * 此类声明并未自动提升， 需置于使用之前声明，否则为 undefined
 */
class CloudRequest extends Request {
  async request(url, data) {
    try {
      return await super.request(url, data)
    } catch (error) {
      Message({
        message: '您没有该操作权限',
        type: 'info',
        duration: 2 * 1000
      })
      throw error
    }
  }
}

export const cloud = new Cloud({
  baseUrl: process.env.VUE_APP_BASE_API_SYS,
  entryUrl: '/admin/entry',
  getAccessToken: getToken,
  requestClass: CloudRequest
})

export const db = cloud.database()
