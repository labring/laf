interface SseEventInterface {
  parsePayload: () => string
}



export const SSE_CONNECT_HEADER = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Retry': '3000',
}

export const SSE_CONNECTED_EVENT = "Connected"



export abstract class SseAbstractEvent implements SseEventInterface {
  id: string;
  type: string;
  data: object;
  retry: number;

  public constructor(id: string, type: string, data: object, retry: number = 3000) {
    this.id = id;
    this.type = type;
    this.data = data;
    this.retry = retry;
  }


  parsePayload(): string {

    // const payload = `id: ${this.id}\nevent: ${this.type}\nretry: ${this.retry || 3000}\ndata: ${JSON.stringify(this.data)}\n\n`

    const payload = `id: ${this.id}\n` +
      `event: ${this.type} \n` +
      `retry: ${this.retry || 3000}\n` +
      `data: hello echo\n\n`
    // `data: ${JSON.stringify(this.data)}\n\n`

    // const eventObj = {
    //   data: JSON.stringify(this.data),
    //   id: this.id,
    //   event: this.type
    // }

    // const payload = `data: ${JSON.stringify(eventObj)}\n\n`
    return payload
  }
}



export class SseConnectedEvent extends SseAbstractEvent {
  public constructor() {
    super(Date.now().toString(), 'message', {
      msg: "connected success"
    })
  }
}

export class SsePongEvent extends SseAbstractEvent {
  public constructor() {
    super(Date.now().toString(), 'pong', {
      msg: "server pong"
    })
  }
}
