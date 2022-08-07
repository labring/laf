import 'axios'

export {}

declare module 'axios' {
    interface AxiosRequestConfig<D = any> {
        noDefaultErrorMsg?: boolean
    }
}