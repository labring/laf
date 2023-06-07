import { Injectable, Logger } from '@nestjs/common'
import {
  SseDefaultEvent,
  SseAbstractEvent,
  SSE_CONNECT_HEADER,
  SseResponseWrapper,
  getSsePongEvent
} from './types'
import { IResponse } from 'src/utils/interface'



@Injectable()
export class SseClientsService {
  private readonly logger = new Logger(SseClientsService.name)

  private clients: SseResponseWrapper[] = []

  constructor() {}



  addClient(userid: string, response: IResponse) {
    const newClient = new SseResponseWrapper(userid, response)
    this.logger.log(`addClient userid=${newClient.userid}`)
    this.clients.push(newClient)
    this.initResponse(newClient)
  }

  initResponse(newClient: SseResponseWrapper) {
    const { userid, response } = newClient

    const onClientClose = () => {
      this.logger.log(`onClientClose client=${userid} disconnected`)
      response.end()
      this.removeClient(userid)
    }

    // monitor the close operation of the client
    response.on('close', onClientClose)
    response.on('end', onClientClose)

    // response sse header
    response.writeHead(200, SSE_CONNECT_HEADER)
    response.flush()
  }


  getClientsCount(): number {
    return this.clients.length
  }

  removeClient(userid: string) {
    this.logger.log(`removeClient client=${userid} disconnected`)
    this.clients = this.clients.filter(client => client.userid !== userid)
  }


  getClients(userid: string): SseResponseWrapper[] {
    return this.clients.filter(item => item.userid.includes(userid))
  }


  sendEvent(userid: string, sseEvent: SseAbstractEvent) {
    if (!userid || !sseEvent) {
      return
    }


    let clients = this.getClients(userid)
    if (!clients || clients.length <= 0) {
      return
    }


    clients.forEach(client => {
      if(!client) {
        return
      }

      let { response } = client
      if (!response) {
        return
      }

      // parse sse payload and write to client
      let payload = sseEvent.parsePayload()
      response.write(payload)
      response.flush()
    })
  }


  sendDefaultEvent(sseEvent: SseDefaultEvent) {
    if (!sseEvent) {
      return
    }

    let { userid } = sseEvent
    if (userid) {
      this.sendEvent(userid, sseEvent)
    }
  }


  /**
   * send broadcast event
   * @param sseEvent
   */
  sendEventBroadcast(sseEvent: SseAbstractEvent) {
    const payload = sseEvent.parsePayload()

    this.clients.forEach(client => {
      let { response } = client
      if (response) {
        response.write(payload)
        response.flush()
      }
    })
  }

  /**
   * send pong event to all client to keep connect
   */
  sendPongEvent() {
    const event = getSsePongEvent()
    this.sendEventBroadcast(event)
  }


  destroyClients() {
    this.clients.forEach(client => {
      let { response } = client

      if (response) {
        response.end()
        client = null
      }
    })
  }
}
