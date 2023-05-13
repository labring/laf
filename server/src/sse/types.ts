import { IResponse } from 'src/utils/interface'
import { randomUUID } from 'crypto'


interface SseEventInterface {
  parsePayload: () => string
}


export const SSE_CONNECT_HEADER = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Retry': '3000',
}

export enum SseEventEnum {
  PONG = 'Pong',
  NPMINSTALL = 'NpmInstall',
}




export abstract class SseAbstractEvent implements SseEventInterface {
  id: string;
  type: SseEventEnum;
  data: object;
  retry: number;

  public constructor(id: string, type: SseEventEnum, data: object, retry: number = 3000) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.retry = retry;
  }


  parsePayload(): string {
    const payload = `id: ${this.id}\n` +
      `event: ${this.type}\n` +
      `retry: ${this.retry || 3000}\n` +
      `data: ${JSON.stringify(this.data)}\n\n`

    return payload
  }
}




export class SsePongEvent extends SseAbstractEvent {
  public constructor(data: object) {
    super(Date.now().toString(), SseEventEnum.PONG, data)
  }
}


export class SseDefaultEvent extends SseAbstractEvent {
  userid: string
  appid: string

  public constructor(userid: string, appid: string, sseEventEnum: SseEventEnum, data: object) {
    super(Date.now().toString(), sseEventEnum, data)

    this.userid = userid
    this.appid = appid
  }
}



export class SseResponseWrapper {
  userid: string
  useridRaw: string
  readonly response: IResponse

  constructor(userid: string, response: IResponse) {
    this.useridRaw = userid
    this.userid = `${userid} ${randomUUID()}`
    this.response = response
  }

}


