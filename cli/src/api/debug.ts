import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import * as urlencode from 'urlencode'

export async function invokeFunction(invokeUrl: string, token: string, funcName: string, data: any): Promise<{ res: any; requestId: string; }> {
  const header: AxiosRequestHeaders | any = {
    'x-laf-debug-token': token,
    'x-laf-func-data': urlencode(JSON.stringify(data)),
  };
  const res = await request({ url: invokeUrl + '/' + funcName, method: "GET", headers: header })
  return {
    res: res.data,
    requestId: res.headers['request-id'],
  }
}


const request = axios.create({
  baseURL: "/",
  withCredentials: true,
  timeout: 30000,
})

// request interceptor
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {

    let _headers: AxiosRequestHeaders | any = {
      "Content-Type": "application/json",
    };
    config.headers = {
      ..._headers,
      ...config.headers,
    };
    return config;
  },
  (error) => {
    console.log("exec error", error);
  },
)


// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log("repeated request: " + error.message);
      process.exit(1)
    } else {
      return Promise.reject(error);
    }
  },
)