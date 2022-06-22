import axios from 'axios'

import { getRemoteServe } from '../utils/util'

import { getAccessToken } from '../utils/tokens'


export const request = axios.create({
    // 联调
    baseURL: getRemoteServe()
})


request.interceptors.request.use(
    async (config) => {
        config.headers.VERSION = ''
        const token = await getAccessToken()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        } else {
            config.headers.Authorization = 'Basic aGVhbHRoOmhlYWx0aA=='
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


/**
 * 描述 axios post 请求
 * @param {Object} obj
 */
export function requestData(obj: object) {

    return request.request(obj)

}




