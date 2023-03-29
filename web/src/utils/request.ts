// http.ts
import { createStandaloneToast } from "@chakra-ui/react";
import axios, { AxiosRequestHeaders, AxiosResponse } from "axios";

import { VITE_SERVER_BASE_URL } from "../constants";

const { toast } = createStandaloneToast();

const request = axios.create({
  baseURL: "/",
  timeout: 30000,
});

// request interceptor
request.interceptors.request.use(
  (config: any) => {
    // auto append service prefix
    if (config.url && config.url?.startsWith("/v1/")) {
      config.url = VITE_SERVER_BASE_URL + config.url;
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
        (window as any).location.href = (VITE_SERVER_BASE_URL + "/login") as string;
        return;
      } else if (data.statusCode === 403) {
        (window as any).location.href = "/403";
      } else if (data.statusCode === 404) {
        toast({
          title: "404 Not Found",
          position: "top",
          status: "error",
          duration: 1000,
        });
      } else if (data.statusCode === 500 || data.statusCode === 502) {
        toast({
          title: "500 Internal Server Error",
          position: "top",
          status: "error",
          duration: 1000,
        });
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
