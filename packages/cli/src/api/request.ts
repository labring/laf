import axios from 'axios'

import { getRemoteServe } from '../utils/util'

import { getAccessToken } from '../utils/tokens'


export const request = axios.create({
    // set baseURL
    baseURL: getRemoteServe()
})

// http request
request.interceptors.request.use(
    async (config) => {

        const token = await getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            console.error("please login first")
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

// http response
request.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
      //return Promise.reject(err);
      console.error(error.response.status)
      console.error(error.response.statusText)
      process.exit(1)
  });



/**
 * 描述 axios request 请求
 * @param {Object} obj
 */
 export function requestData( obj:object) {
  
      return request.request(obj)

}




