import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Header,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
  Req,
  Res,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { Readable } from 'stream'
// import { CreateFunctionDto } from './dto/create-function.dto'
// import { UpdateFunctionDto } from './dto/update-function.dto'
import { ResponseUtil } from '../utils/response'
import { IRequest, IResponse } from '../utils/interface'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
// import { JwtAuthGuard } from '../auth/jwt.auth.guard'
// import { ApplicationAuthGuard } from '../auth/application.auth.guard'
import { SseClientsService } from './sse-clients.service'
import { Subscription, interval } from 'rxjs'
// import { IRequest } from '../utils/interface'


@ApiTags('Sse Client')
// @ApiBearerAuth('Authorization')
@Controller('events/:userid')
export class SseClientsController implements OnModuleInit, OnModuleDestroy {

  constructor(
    private readonly sseClientsService: SseClientsService,
  ) { }

  // @Get()
  // @Header('Content-Type', 'text/event-stream')
  // streamEvents(@Param('userid') userid: string, @Req() request, @Res() response: IResponse) {
  //   response.flushHeaders()
  //   this.sseClientsService.addClient(userid, response)

  //   request.on('close', () => {
  //     console.log('SSE client disconnected')
  //     // 手动释放连接
  //     this.sseClientsService.removeClient(userid)
  //   });
  // }


  private clients: any[] = []

  private eventEmitter: Subscription

  @Get()
  streamEvents(@Param('userid') userid: string, @Req() request, @Res() response: IResponse): void {
    console.log('clients add userid===>' + userid)

    // response.writeHead(200, {
    //   'Content-Type': 'text/event-stream',
    //   'Cache-Control': 'no-cache',
    //   'Connection': 'keep-alive',
    //   'Access-Control-Allow-Origin': '*',
    // })

    this.sseClientsService.addClient(userid, response)

    // // 连接成功确认消息
    // const data = `data: This is statrt message ${userid}\n\n`;
    // response.write(data)
    // response.flush()

    // // 清除定时器和客户端连接信息
    // const onClientClose = () => {
    //   console.log(`client ${userid} disconnected`)
    //   response.end()
    //   this.sseClientsService.removeClient(userid)
    //   this.clients = this.clients.filter(item => item.userid !== userid)
    // }
    // response.on('close', onClientClose)
    // response.on('end', onClientClose)

    // const newClient = { userid, response }
    // this.clients.push(newClient)
  }


  sendEventToClients(event: any) {
    const payload = `id: ${new Date().getTime().toString()}\n` +
      `event: message\n` +
      `data: ${JSON.stringify(event)}\n\n`

    this.clients.forEach(client => {
      client.response.write(payload)
      client.response.flush()
    })
  }


  // 在此处，我们在控制器初始化时启动一个事件处理器，以便事件可以被推送到 SSE 流中
  onModuleInit() {
    console.log('onModuleInit ..... ')
    this.eventEmitter = interval(3000).subscribe(() => {
      // this.sendEventToClients({ message: 'Server message at 3000 loop' + new Date().toISOString() })
      this.sseClientsService.sendPongEvent()
    });
  }

  // 在控制器销毁时停止事件处理器以释放资源
  onModuleDestroy() {
    console.log('onModuleDestroy ..... ')
    this.eventEmitter.unsubscribe()
  }

}
