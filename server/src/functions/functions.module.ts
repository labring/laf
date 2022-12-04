import { Module } from '@nestjs/common'
import { ApplicationsModule } from 'src/applications/applications.module'
import { PrismaService } from 'src/prisma.service'
import { CoreModule } from '../core/core.module'
import { FunctionsController } from './functions.controller'
import { FunctionsService } from './functions.service'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [FunctionsController],
  providers: [FunctionsService, PrismaService],
})
export class FunctionsModule {}
