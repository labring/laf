import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { FunctionController } from './function.controller'
import { FunctionService } from './function.service'
import { DatabaseModule } from 'src/database/database.module'
import { TriggerService } from 'src/trigger/trigger.service'
import { HttpModule } from '@nestjs/axios'
import { ApplicationModule } from 'src/application/application.module'

@Module({
  imports: [ApplicationModule, DatabaseModule, HttpModule],
  controllers: [FunctionController],
  providers: [FunctionService, JwtService, TriggerService],
  exports: [FunctionService],
})
export class FunctionModule {}
