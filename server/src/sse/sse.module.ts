import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApplicationModule } from '../application/application.module'
import { SseClientsController } from './sse-clients.controller'
import { SseClientsService } from './sse-clients.service'
import { DatabaseModule } from 'src/database/database.module'
import { SseEventsourceService } from './sse-eventsource.service'

@Module({
  imports: [ApplicationModule, DatabaseModule],
  controllers: [SseClientsController],
  providers: [SseClientsService, SseEventsourceService, JwtService],
  exports: [SseClientsService, SseEventsourceService],
})
export class SseModule { }
