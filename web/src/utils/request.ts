// http.ts
import { createStandaloneToast } from "@chakra-ui/react";
import axios, { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from "axios";

const { toast } = createStandaloneToast();

const request = axios.create({
  baseURL: "/",
  withCredentials: true,
  timeout: 30000,
});

// request interceptor
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // auto append service prefix
    if (config.url && config.url?.startsWith("/v1/")) {
      config.url = import.meta.env.VITE_SERVER_URL + config.url;
    }

    let _headers: AxiosRequestHeaders | any = {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "Content-Type": "application/json",
    };

    config.headers = {
      ..._headers,
      ...config.headers,
    };
    return config;
  },
  (error) => {
    error.data = {};
    error.data.msg = "The server is abnormal, please contact the administrator!";
    return Promise.resolve(error);
  },
);

// response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    return data;
  },
  (error) => {
    if (axios.isCancel(error)) {
      console.log("repeated request: " + error.message);
    } else {
      // handle error code
      const { data } = error.response;
      if (data.statusCode === 401) {
        // eslint-disable-next-line no-restricted-globals
        // (window as any).location.href = (import.meta.env.VITE_SERVER_URL + "/v1/login") as string;
        return;
      }
      toast({
        title: data.message,
        position: "top",
        status: "error",
        duration: 1000,
      });

      error.data = {};
      error.data.msg = "Please check the network or contact the administrator!";
      return Promise.reject(error);
    }
  },
);

export default request;
