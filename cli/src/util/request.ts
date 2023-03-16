// request.ts
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import { existSystemConfig, readSystemConfig, refreshToken } from '../config/system'
import { DEFAULT_REMOTE_SERVER } from '../common/constant'

export const request = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 30000,
})

// request interceptor
request.interceptors.request.use(
  async (config: any) => {
    let _headers: AxiosRequestHeaders | any = {
      'Content-Type': 'application/json',
    }

    // load remote server and token
    if (existSystemConfig() && config.url?.startsWith('/v1/')) {
      let { remoteServer, token, tokenExpire } = readSystemConfig()
      if (config.url?.indexOf('pat2token') === -1) {
        const timestamp = Date.parse(new Date().toString()) / 1000
        if (tokenExpire < timestamp) {
          token = await refreshToken()
        }
      }
      config.url = remoteServer + config.url
      _headers.Authorization = 'Bearer ' + token
    } else {
      config.url = DEFAULT_REMOTE_SERVER + config.url
    }

    config.headers = {
      ..._headers,
      ...config.headers,
    }
    return config
  },
  (error) => {
    error.data = {}
    error.data.msg = 'The server is abnormal, please contact the administrator!'
    console.log('request error', error)
  },
)

// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response
    if (data.error == null) {
      return data.data
    }
    console.error(data.error)
    process.exit(1)
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('repeated request: ' + error.message)
      process.exit(1)
    } else {
      // handle error code
      const { statusCode, data } = error.response.data
      if (statusCode === 400) {
        console.log('Bad request!')
        console.log(data.message)
        process.exit(1)
      } else if (statusCode === 401) {
        console.log('please first login')
        process.exit(1)
      } else if (statusCode == 403) {
        console.log('Forbidden resource!')
        process.exit(1)
      } else if (statusCode === 500) {
        console.log('Internal server error!')
        process.exit(1)
      } else if (statusCode === 503) {
        console.log('The server is abnormal, please contact the administrator!')
        process.exit(1)
      }
      return Promise.reject(error)
    }
  },
)

export type RequestParams = any
