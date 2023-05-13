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
    const payload = `id: ${this.id}\n` +
      `event: ${this.type}\n` +
      `retry: ${this.retry || 3000}\n` +
      `data: ${JSON.stringify(this.data)}\n\n`

    return payload;
  }
}
