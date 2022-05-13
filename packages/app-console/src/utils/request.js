import axios from 'axios'
import { MessageBox } from 'element-ui'
import store from '@/store'
import { getToken } from '@/utils/auth'
import { showInfo } from './show'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API_SYS, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    const token = getToken()
    if (token) {
      // let each request carry token
      // please modify it according to the actual situation
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
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
    return response.data
  },
  error => {
    const status = error.response.status

    if (status === 401) {
      // to re-login
      MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: 'Re-Login',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken')
          .then(() => { location.reload() })
      })
      return Promise.reject(error)
    }
    if (status === 403) {
      showInfo('无此操作权限')
      return Promise.reject(error)
    }
    if (status === 422) {
      showInfo('参数错误')
      return Promise.reject(error)
    }

    // showError(error.message)
    return Promise.reject(error)
  }
)

export default service
