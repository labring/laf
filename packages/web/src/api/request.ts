import axios from 'axios'
import { useUserStore } from '~/store/user'

// create an axios instance
const service = axios.create({
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.token

    if (token) {
      if (config.headers)
        config.headers.Authorization = `Bearer ${token}`
      else
        config.headers = { Authorization: `Bearer ${token}` }
    }
    return config
  },
  (error) => {
    // Do something with request error
    Promise.reject(error)
  },
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
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response.status

    if (status === 401) {
      // to re-login
      // ElMessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
      //   confirmButtonText: 'Re-Login',
      //   cancelButtonText: 'Cancel',
      //   type: 'warning',
      // }).then(() => {
      //   const userStore = useUserStore()

      //   userStore.logOut()
      //     .then(() => { location.reload() })
      // })
      return Promise.reject(error)
    }
    if (status === 403) {
      ElMessage.warning('无此操作权限')
      return Promise.reject(error)
    }

    ElMessage.error(error.response.data.message)
    return Promise.reject(error)
  },
)

export default service
