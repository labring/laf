import { Module } from '@nestjs/common'
import { ApplicationController } from './application.controller'
import { ApplicationService } from './application.service'
import { PrismaService } from '../prisma.service'
import { ApplicationTaskService } from './application-task.service'
import { InstanceService } from '../instance/instance.service'
import { JwtService } from '@nestjs/jwt'
import { FunctionService } from '../function/function.service'
import { EnvironmentVariableService } from './environment.service'
import { EnvironmentVariableController } from './environment.controller'
import { StorageModule } from '../storage/storage.module'
import { RegionModule } from '../region/region.module'
import { DatabaseModule } from 'src/database/database.module'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  imports: [StorageModule, RegionModule, DatabaseModule, GatewayModule],
  controllers: [ApplicationController, EnvironmentVariableController],
  providers: [
    ApplicationService,
    PrismaService,
    ApplicationTaskService,
    InstanceService,
    JwtService,
    FunctionService,
    EnvironmentVariableService,
  ],
  exports: [ApplicationService],
})
export class ApplicationModule {}
