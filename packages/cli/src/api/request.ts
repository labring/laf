import axios from 'axios'

import { API_BASE_URL } from '../config/config'


export const request = axios.create({
    // 联调
    baseURL: API_BASE_URL
})

/**
 * 描述 axios post 请求
 * @param {Object} obj
 */
 export function requestData( obj:object) {
  
      return request.request(obj)

}


/**
 * 描述 axios post 请求
 *  @param {string} url
 * @param {Object} data
 */
 export function postData( url:string,data:object) {
  
    return request.post(url,data)

}


/**
 * 描述 axios get 请求
 * @param {Object} obj

 * @returns {Promise}
 */
export function get(obj:object) {
    return request(obj)
}




