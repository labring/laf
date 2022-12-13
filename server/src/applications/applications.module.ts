import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsService } from './applications.service'
import { PrismaService } from '../prisma.service'
import { ApplicationTaskService } from './application-task.service'
import { InstanceService } from 'src/instance/instance.service'
import { JwtService } from '@nestjs/jwt'
import { FunctionsService } from 'src/functions/functions.service'

@Module({
  imports: [CoreModule],
  controllers: [ApplicationsController],
  providers: [
    ApplicationsService,
    PrismaService,
    ApplicationTaskService,
    InstanceService,
    JwtService,
    FunctionsService,
  ],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
