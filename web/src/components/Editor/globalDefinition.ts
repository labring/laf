export const globalDefinition = `

declare class FunctionConsole {
  private _logs;
  get logs(): any[];
  log(...params: any[]): void;
}

interface File {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}


interface FunctionContext {
  /**
   * Parsed bearer JWT payload
   */
  auth?: {
    uid?: string
  }

  /**
   * Files uploaded by HTTP Request
   */
  files?: File[];

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders;

  /**
   * HTTP query object parsed by Express
   */
  query?: any;

  /**
   * HTTP body object parsed by Express
   */
  body?: any;

  /**
   * HTTP request ID
   */
  requestId?: string;

  /**
   * HTTP method
   */
  method?: string;

  /**
   * Express response object
   */
  response: HttpResponse

  /**
   * WebSocket object
   */
  socket?: WebSocket
}

interface IModule {
  exports: IExports
}

interface IExports {
  main: (ctx: FunctionContext) => any
}

declare const module: IModule
declare const exports: IExports
declare const console: FunctionConsole
declare const global: typeof globalThis


declare function main(ctx: FunctionContext): any;
`;
