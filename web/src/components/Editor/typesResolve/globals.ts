import { objectidType } from "./objectidType";
import { requestType } from "./requestType";
import { responseType } from "./responseType";
import { readableStreamTypes, streamTypes, writableStreamTypes } from "./streamType";

export const globalDeclare = `
${streamTypes}
${readableStreamTypes}
${writableStreamTypes}
${requestType}
${responseType}
${objectidType}

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


/**
 * The input parameters of cloud function calls
 */
interface FunctionContext {
  __function_name: string;
  
  /**
   * This object is parsed from JWT Token Payload
   */
  user?: {
    [key: string]: any
  }

  /**
   * Uploaded file, the file object array
   */
  files?: File[];

  /**
   * HTTP headers
   */
  headers?: IncomingHttpHeaders;

  /**
   * HTTP Query parameter (URL parameter), JSON object
   */
  query?: any;

  /**
   * HTTP Body
   */
  body?: any;

  /**
   *
   */
  params?: any;

  /**
   * HTTP Request ID
   */
  requestId?: string;

  /**
   * HTTP Method
   */
  method?: string;

  /**
   * Express request object
   */
  request?: HttpRequest;

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
  exports: IExports
}

interface IExports {
  /**
   * The main function, entry of the cloud function
   */
  main: (ctx: FunctionContext) => any
}

interface IProcess {
  /**
   * Environment
   */
  env: any
}

declare const module: IModule
declare const exports: IExports
declare const console: FunctionConsole
declare const global: typeof globalThis
declare const process: IProcess

/**
 *  The main function, entry of the cloud function
 */
declare function main(ctx: FunctionContext): any;
`;
