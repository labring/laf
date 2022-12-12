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
      config.url = process.env.NEXT_PUBLIC_API_SERVER + config.url;
    }

    let _headers: AxiosRequestHeaders | any = {
      Authorization: "Bearer " + localStorage.getItem("token"),
    };

    // const session = useSessionStore.getState().session;
    // if (session?.token?.access_token) {
    //   const token = session.token.access_token;
    //   if (token) {
    //     _headers["Authorization"] = `Bearer ${token}`;
    //   }
    // }

    if (!config.headers || config.headers["Content-Type"] === "") {
      _headers["Content-Type"] = "application/json";
    }

    config.headers = _headers;
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
        const loginUrl = process.env.NEXT_PUBLIC_API_SERVER + '/v1/login';
        location.href = loginUrl;
        return;
      }
      toast({
        title: data.message,
        position: "top",
        status: "error",
        duration: 1000,
      });

      error.data = {};
      error.data.msg = "请求超时或服务器异常，请检查网络或联系管理员！";
      return Promise.reject(error);
    }
  },
);

export default request;
