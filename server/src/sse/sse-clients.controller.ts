import {
  Controller,
  Get,
  UseGuards,
  Req,
  Res,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { IRequest, IResponse } from '../utils/interface'

import { SseClientsService } from './sse-clients.service'
import { Subscription, interval } from 'rxjs'
import {JwtAuthGuard} from "../auth/jwt.auth.guard";
import {ApiResponseObject, ResponseUtil} from "../utils/response";
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {QuerySseClientNumDto} from "./dto/query-sseclientnum.dto";


@ApiTags('Sse Client')
@ApiBearerAuth('Authorization')
@Controller('events')
export class SseClientsController implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly sseClientsService: SseClientsService,
  ) { }

  private eventEmitter: Subscription


  /**
   * sse connect
   * @param req
   * @param response
   */
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Sse Connect Server' })
  @Get('/connect')
  connectSse(@Req() req: IRequest, @Res() response: IResponse): void {
    const user = req.user
    const userid = user._id.toString()
    this.sseClientsService.addClient(userid, response)
  }


  /**
   * get sse client number
   */
  @Get('/sseClients')
  @ApiResponseObject(QuerySseClientNumDto)
  getSseClient() {
    const total = this.sseClientsService.getClientsCount()
    let data: QuerySseClientNumDto = {
      total
    }

    return ResponseUtil.ok(data)
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
