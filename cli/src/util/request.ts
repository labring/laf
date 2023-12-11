// request.ts
import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import { UserSchema } from '../schema/user'

export const request = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 30000,
})

// request interceptor
request.interceptors.request.use(
  async (config: any) => {
    const _headers: AxiosRequestHeaders | any = {}
    if (config.headers['Content-Type']) {
      _headers['Content-Type'] = config.headers['Content-Type']
    } else {
      _headers['Content-Type'] = 'application/json'
    }

    // load remote server and token
    if (UserSchema.exist() && config.url?.startsWith('/v1/')) {
      const user = UserSchema.getCurrentUser()
      const { server, expire } = user
      let { token } = user
      if (token === undefined || token === '') {
        console.log('please login first')
        process.exit(1)
      }
      if (config.url?.indexOf('pat2token') === -1) {
        const timestamp = Date.parse(new Date().toString()) / 1000
        if (expire < timestamp) {
          token = await UserSchema.refreshToken()
        }
        config.url = server + config.url
      }
      _headers.Authorization = 'Bearer ' + token
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
    const { data, headers } = response
    if (headers['content-type'] === 'application/octet-stream') {
      return data
    }
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
      const { status, data } = error.response
      if (status === 400) {
        console.log('Bad request!')
        console.log(data.message)
        process.exit(1)
      } else if (status === 401) {
        console.log('User not logged in or expired, please log in again')
        process.exit(1)
      } else if (status == 403) {
        console.log('Unauthorized resource request')
        process.exit(1)
      } else if (status === 500) {
        console.log('Internal server error!')
        process.exit(1)
      } else if (status === 503) {
        console.log('The server is abnormal, please contact the administrator!')
        process.exit(1)
      } else if (status === 404) {
        console.log(`Request ${error.response.config.url} not found, please check remote server url`)
        process.exit(1)
      }
      return Promise.reject(error.message)
    }
  },
)

export type RequestParams = any
