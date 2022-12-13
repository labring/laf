import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ApplicationsModule } from 'src/applications/applications.module'
import { PrismaService } from 'src/prisma.service'
import { CoreModule } from '../core/core.module'
import { FunctionsController } from './functions.controller'
import { FunctionsService } from './functions.service'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [FunctionsController],
  providers: [FunctionsService, PrismaService, JwtService],
})
export class FunctionsModule {}
