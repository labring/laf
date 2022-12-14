import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApplicationModule } from '../application/application.module'
import { FunctionService } from '../function/function.service'
import { PrismaService } from '../prisma.service'
import { LogController } from './log.controller'

@Module({
  imports: [ApplicationModule],
  controllers: [LogController],
  providers: [FunctionService, PrismaService, JwtService],
})
export class LogModule {}
