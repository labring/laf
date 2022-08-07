import type { AxiosResponse } from 'axios'
import axios, { AxiosError } from 'axios'
import { useConfigStore } from '~/store'
import { useUserStore } from '~/store/user'
import { errorMsg, warnMsg } from '~/utils/message'

// create an axios instance
const service = axios.create({
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
})

// request interceptor
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const globalConfig = useConfigStore()
    const token = userStore.token

    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
      'Accept-Language': globalConfig.local.language,
    }

    return config
  },
)

function isErrorResponse(res: AxiosResponse) {
  return !!res.data.error
}

function createAxiosError(res: AxiosResponse) {
  return new AxiosError(res.data.error, 'ERR_RESPONSE', res.config, res.request, res)
}

// response interceptor
service.interceptors.response.use(
  (response: any) => {
    if (isErrorResponse(response))
      return Promise.reject(createAxiosError(response))
    return response.data
  },
)

service.interceptors.response.use(undefined, (error: AxiosError<any, any>) => {
  const status = error.response?.status

  if (status === 401)
    return Promise.reject(error)

  if (status === 403) {
    warnMsg('无此操作权限')
    return Promise.reject(error)
  }

  if (!error.config.noDefaultErrorMsg)
    errorMsg(error.message || '请求发生了异常')

  return Promise.reject(error)
})

export default service
