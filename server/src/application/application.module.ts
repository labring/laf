import { Module } from '@nestjs/common'
import { ApplicationController } from './application.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationService } from './application.service'
import { PrismaService } from '../prisma.service'
import { ApplicationTaskService } from './application-task.service'
import { InstanceService } from '../instance/instance.service'
import { JwtService } from '@nestjs/jwt'
import { FunctionService } from '../function/function.service'
import { StorageService } from '../storage/storage.service'
import { EnvironmentVariableService } from './environment.service'
import { EnvironmentVariableController } from './environment.controller'

@Module({
  imports: [CoreModule],
  controllers: [ApplicationController, EnvironmentVariableController],
  providers: [
    ApplicationService,
    PrismaService,
    ApplicationTaskService,
    InstanceService,
    JwtService,
    FunctionService,
    StorageService,
    EnvironmentVariableService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
