import axios, { AxiosRequestHeaders, AxiosResponse } from 'axios'
import * as urlencode from 'urlencode'

export async function invokeFunction(
  invokeUrl: string,
  token: string,
  funcName: string,
  funcData: any,
  method = 'GET',
  query = '',
  data = '',
  customerHeader: any = {},
): Promise<{ res: any; requestId: string }> {
  const header: AxiosRequestHeaders | any = {
    'x-laf-develop-token': token,
    'x-laf-func-data': urlencode(JSON.stringify(funcData)),
    'Content-Type': 'application/x-www-form-urlencoded', // default content type
    ...customerHeader,
  }
  const res = await request({
    url: invokeUrl + '/' + funcName + (query ? '?' + query : ''),
    method: method,
    headers: header,
    data: data,
  })
  return {
    res: res.data,
    requestId: res.headers['request-id'],
  }
}

const request = axios.create({
  baseURL: '/',
  withCredentials: true,
  timeout: 30000,
})

// request interceptor
request.interceptors.request.use(
  (config: any) => {
    const _headers: AxiosRequestHeaders | any = {
      'Content-Type': 'application/json',
    }
    config.headers = {
      ..._headers,
      ...config.headers,
    }
    return config
  },
  (error) => {
    console.log('exec error', error)
  },
)

// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log('repeated request: ' + error.message)
      process.exit(1)
    } else {
      return Promise.reject(error)
    }
  },
)
