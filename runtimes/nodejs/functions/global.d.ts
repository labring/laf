/**
 * The input parameters of cloud function calls
 */
declare interface FunctionContext {
  __function_name: string

  /**
   * This object is parsed from JWT Token Payload
   */
  user?: {
    [key: string]: any
  }

  /**
   * Uploaded file, the file object array
   */
  files?: File[]

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders

  /**
   * HTTP Query parameter (URL parameter), JSON object
   */
  query?: any

  /**
   * HTTP Body
   */
  body?: any

  /**
   *
   */
  params?: any

  /**
   * HTTP Request ID
   */
  requestId?: string

  /**
   * HTTP Method
   */
  method?: string

  /**
   * Express request object
   */
  request?: HttpRequest

  /**
   * Express response object
   */
  response?: HttpResponse

  /**
   * WebSocket object
   */
  socket?: WebSocket

  [key: string]: any
}

interface IModule {
  exports: any
}

interface IProcess {
  /**
   * Environment
   */
  env: any
}

declare const module: IModule
declare const process: IProcess
