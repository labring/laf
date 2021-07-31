
export const global_declare = `
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
  auth?: {
    uid?: string
  }
  files?: File[];
  headers?: IncomingHttpHeaders;
  query?: any;
  body?: any;
  params?: any;
  auth?: any;
  requestId?: string;
  method?: string;
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
declare function main(ctx: FunctionContext): any;
`
