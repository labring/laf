
interface ResponseStruct {
  code: number
  data: any
  error: string
  requestId: string
  [extra: string]: any
}

export interface RequestInterface {
  send(action: string, data: object): Promise<ResponseStruct>
}
