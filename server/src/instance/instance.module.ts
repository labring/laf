import { Module } from '@nestjs/common'
import { InstanceService } from './instance.service'
import { InstanceTaskService } from './instance-task.service'
import { StorageModule } from '../storage/storage.module'
import { DatabaseModule } from '../database/database.module'
import { TriggerModule } from 'src/trigger/trigger.module'
import { ApplicationModule } from 'src/application/application.module'
import { JwtService } from '@nestjs/jwt'

@Module({
  imports: [StorageModule, DatabaseModule, TriggerModule, ApplicationModule],
  providers: [InstanceService, InstanceTaskService, JwtService],
})
export class InstanceModule {}
