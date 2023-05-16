import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { SsePongEvent, SseDefaultEvent, SseAbstractEvent, SSE_CONNECT_HEADER, SseResponseWrapper } from './types'
import { IResponse } from 'src/utils/interface'



@Injectable()
export class SseClientsService {
  private readonly logger = new Logger(SseClientsService.name)

  private clients: any[] = []

  constructor(
    private readonly prisma: PrismaService,
  ) { }



  addClient(userid: string, response: IResponse) {
    this.logger.log(`addClient new userid=`, userid)
    const newClient = new SseResponseWrapper(userid, response)
    this.clients.push(newClient)
    this.initResponse(newClient)
  }

  initResponse(newClient: SseResponseWrapper) {
    const { userid, response } = newClient

    // 清除客户端连接信息
    const onClientClose = () => {
      console.log(`client ${userid} disconnected`)
      response.end()
      this.removeClient(userid)
    }
    response.on('close', onClientClose)
    response.on('end', onClientClose)
    response.writeHead(200, SSE_CONNECT_HEADER)
    response.flush()
  }


  getClientsCount(): number {
    return this.clients.length
  }

  removeClient(userid: string) {
    console.log(`removeClient userid`, userid)
    this.clients = this.clients.filter(client => client.userid !== userid)
  }


  getClient(userid: string): Record<string, any> {
    return this.clients.find(item => item.userid == userid)
  }


  sendEvent(userid: string, sseEvent: SseAbstractEvent) {
    if (!userid || !sseEvent) {
      return
    }

    let { response } = this.getClient(userid)
    if (!response) {
      return
    }

    let payload = sseEvent.parsePayload()
    response.write(payload)
    response.flush()
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


  sendEventBroadcast(sseEvent: SseAbstractEvent) {
    const payload = sseEvent.parsePayload()
    console.log('sendEventBroadcast====size', this.clients.length)


    this.clients.forEach(client => {
      let { response } = client
      if (response) {
        response.write(payload)
        response.flush()
      }
    })
  }

  sendPongEvent() {
    const ssePongEvent = new SsePongEvent({ msg: "hello pong..." })
    this.sendEventBroadcast(ssePongEvent)
  }
}
