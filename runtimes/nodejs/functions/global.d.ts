declare class FunctionConsole {
  private _logs
  get logs(): any[]
  log(...params: any[]): void
}

interface File {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  size: number
  destination: string
  filename: string
  path: string
}

/**
 * Params of cloud function
 */
interface FunctionContext {
  /**
   * payload object parsed from JWT token
   */
  user?: any

  /**
   * files uploaded
   */
  files?: File[]

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders

  /**
   * HTTP query params
   * @see https://expressjs.com/en/4x/api.html#req.query
   */
  query?: {
    [key: string]: string
  }

  /**
   * HTTP body data
   * @see https://expressjs.com/en/4x/api.html#req.body
   */
  body?: any

  /**
   * HTTP request id
   */
  requestId?: string

  /**
   * HTTP methods
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'WebSocket:connection' | 'WebSocket:close' | 'WebSocket:message' | 'WebSocket:error'

  /**
   * Response object of express
   * @see https://expressjs.com/en/4x/api.html#res
   */
  response: HttpResponse

  /**
   * WebSocket object
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
   */
  socket?: WebSocket
}

interface IModule {
  exports: IExports
}

interface IExports {
  /**
   * 主函数，云函数的入口函数
   */
  main: (ctx: FunctionContext) => any
}

declare const module: IModule
declare const exports: IExports
declare const console: FunctionConsole
declare const global: typeof globalThis

/**
 * 主函数，云函数的入口函数
 */
declare function main(ctx: FunctionContext): any
