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
 * 云函数调用入参
 */
interface FunctionContext {
  /**
   * auth 对象解析自 JWT Token Payload
   */
  auth?: {
    uid?: string
  }

  /**
   * 上传到云函数的文件
   */
  files?: File[]

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders

  /**
   * HTTP Query 参数 （URL 参数），JSON 对象
   */
  query?: any

  /**
   * HTTP Body 参数， JSON 对象
   */
  body?: any

  /**
   * Trigger 调用时为触发器所带参数
   */
  params?: any

  /**
   * HTTP Request ID
   */
  requestId?: string

  /**
   * 调用方法：GET | POST | PUT | DELETE | TRIGGER
   */
  method?: string

  /**
   * Express Response 对象
   */
  response: HttpResponse

  /**
   * WebSocket 对象
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