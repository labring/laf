import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  Res,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { IRequest, IResponse } from '../utils/interface'

import {
  ApiTags,
} from '@nestjs/swagger'
import { SseClientsService } from './sse-clients.service'
import { Subscription, interval } from 'rxjs'


@ApiTags('Sse Client')
// @ApiBearerAuth('Authorization')
@Controller('events')
export class SseClientsController implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly sseClientsService: SseClientsService,
  ) { }


  private eventEmitter: Subscription

  @Get('/:userid')
  connectSse(@Param('userid') userid: string, @Req() request, @Res() response: IResponse): void {
    this.sseClientsService.addClient(userid, response)
  }


  @Post('/sseClients')
  getSseClient(): number {
    return this.sseClientsService.getClientsCount()
  }


  // start an event trigger when the controller is initialized, pushing a Pong message to the client every 5 seconds to keep the client connected
  onModuleInit() {
    this.eventEmitter = interval(5000).subscribe(() => {
      this.sseClientsService.sendPongEvent()
    })
  }

  // stop the eventEmitter and release client resources when the controller is destroyed
  onModuleDestroy() {
    this.eventEmitter.unsubscribe()
    this.sseClientsService.destroyClients()
  }

}
