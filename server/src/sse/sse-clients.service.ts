import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subscriber } from 'rxjs'
import { PrismaService } from 'src/prisma/prisma.service'
import { filter } from 'rxjs/operators'
import { Response } from 'express'
import { Readable } from 'stream'
import { SseConnectedEvent, SsePongEvent, SseAbstractEvent, SSE_CONNECT_HEADER, SSE_CONNECTED_EVENT } from './types'
import { IResponse } from 'src/utils/interface'


@Injectable()
export class SseClientsService {
  private readonly logger = new Logger(SseClientsService.name)


  private clients: any[] = []
  // private readonly clients = new Map<string, IResponse>()


  constructor(
    private readonly prisma: PrismaService,
  ) { }



  addClient(userid: string, response: IResponse) {
    this.logger.log(`addClient new userid=`, userid)

    const newClient = { userid, response }
    this.clients.push(newClient)

    // 清除定时器和客户端连接信息
    const onClientClose = () => {
      console.log(`client ${userid} disconnected`)
      response.end()
      this.removeClient(userid)
    }
    response.on('close', onClientClose)
    response.on('end', onClientClose)

    response.writeHead(200, SSE_CONNECT_HEADER)
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

  sendPongEvent() {
    this.clients.forEach(client => {
      let { response } = client
      if (!response) {
        return
      }

      let payload = new SsePongEvent().parsePayload()
      response.write(payload)
      response.flush()
    })
  }
}
