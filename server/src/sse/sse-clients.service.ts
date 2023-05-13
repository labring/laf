import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subscriber } from 'rxjs'
import { PrismaService } from 'src/prisma/prisma.service'
import { filter } from 'rxjs/operators'
import { Response } from 'express'
import { SSE_CONNECT_HEADER, SSE_CONNECTED_EVENT, SseAbstractEvent } from './types'


@Injectable()
export class SseClientsService {
  private readonly logger = new Logger(SseClientsService.name)

  // private readonly clients = new Map<Response, { subscriber: Subscriber<any>, event: string }>()
  private readonly clients = new Map<string, { subscriber: Subscriber<any>, response: Response }>()

  constructor(
    private readonly prisma: PrismaService,
  ) { }



  addClient(userid: string, response: Response): Observable<any> {
    if (!this.clients.has(userid)) {

      const observable = new Observable((subscriber) => {
        this.clients.set(userid, { subscriber, response })

        response.status(200)
          .set(SSE_CONNECT_HEADER)
          .flushHeaders()
        response.write(`event: ${SSE_CONNECTED_EVENT}\n\n`)

        return () => {
          this.removeClient(userid);
        };
      })

      return observable.pipe(filter((data) => !!data))
    }
  }


  getClientsCount(): number {
    return this.clients.size
  }

  removeClient(userid: string) {
    this.clients.delete(userid)
  }


  getClient(userid: string): Response {
    if (!this.clients.has(userid)) {
      this.logger.warn(`userid={} can not exist clients`, userid);
      return null
    }

    return this.clients.get(userid)
  }


  sendEvent(userid: string, sseEvent: SseAbstractEvent) {
    if (!userid || !sseEvent) {
      return
    }

    let client = this.getClient(userid)
    if (!client) {
      return
    }

    let { subscriber, response } = client
    let payload = sseEvent.parsePayload()
    response.write(payload)

    subscriber.next({ userid, sseEvent })
  }
}
