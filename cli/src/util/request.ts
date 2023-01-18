// http.ts
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";
import { existSystemConfig, readSystemConfig, refreshToken } from "../config/system";

export const request = axios.create({
  baseURL: "/",
  withCredentials: true,
  timeout: 30000,
});

// request interceptor
request.interceptors.request.use(
  async (config: AxiosRequestConfig) => {

    let _headers: AxiosRequestHeaders | any = {
      "Content-Type": "application/json",
    };

    // load remote server and token
    if (existSystemConfig() && config.url?.startsWith("/v1/")) {
      let { remoteServer, token, tokenExpire } = readSystemConfig();
      if (config.url?.indexOf('pat2token') === -1) {
        const timestamp = Date.parse(new Date().toString()) / 1000;
        if (tokenExpire < timestamp) {
          token = await refreshToken()
        }
      }
      config.url = remoteServer + config.url;
      _headers.Authorization = 'Bearer ' + token;
    }

    config.headers = {
      ..._headers,
      ...config.headers,
    };
    return config;
  },
  (error) => {
    error.data = {};
    error.data.msg = "The server is abnormal, please contact the administrator!";
    console.log("request error", error);
  },
);

// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data.error == null) {
      return data.data;
    }
    console.error(data.error);
    process.exit(1)
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log("repeated request: " + error.message);
      process.exit(1)
    } else {
      // handle error code
      console.log(error)
      const { status, data } = error.response;
      if (status === 400) {
        console.log("Bad request!")
        console.log(data.message)
        process.exit(1)
      }
      else if (status === 401) {
        console.log("please first login")
        process.exit(1)
      }
      else if (status == 403) { 
        console.log("Forbidden resource!")
        process.exit(1)
      }
      else if (status === 503) {
        console.log("The server is abnormal, please contact the administrator!")
        process.exit(1)
      }
      return Promise.reject(error);
    }
  },
);

export type RequestParams = any;


