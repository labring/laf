import axios from 'axios'
import { getRemoteServer } from '../utils/util'
import { getAccessToken } from '../utils/tokens'


export const request = axios.create({
  // set baseURL
  baseURL: getRemoteServer()
})

// http request
request.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.error("please login first: `laf-cli login -u username -p password`")
      process.exit(1)
    }
    return config
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {}
    error.data.msg = '服务器异常，请联系管理员！'
    return Promise.resolve(error)
  },
)



request.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    return response
  },
  error => {
    const status = error.response.status

    if (status === 401) {
      console.error(error.response.data)
      process.exit(1)

    }
    if (status === 403) {
      console.error(error.response.data)
      process.exit(1)
    }
    if (status === 404) {
      console.error(error.response.data)
      process.exit(1)
    }
    if (status === 422) {
      console.error(error.response.data)
      process.exit(1)
    }

    // showError(error.message)
    return Promise.reject(error)
  }
)



/**
 * 描述 axios request 请求
 * @param {Object} obj
 */
export function requestData(obj: object) {
  return request.request(obj)
}




