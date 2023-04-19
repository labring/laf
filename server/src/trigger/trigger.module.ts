import { Module } from '@nestjs/common'
import { TriggerService } from './trigger.service'
import { TriggerController } from './trigger.controller'
import { JwtService } from '@nestjs/jwt'
import { ApplicationService } from 'src/application/application.service'
import { StorageModule } from 'src/storage/storage.module'
import { HttpModule } from '@nestjs/axios'
import { CronJobService } from './cron-job.service'
import { TriggerTaskService } from './trigger-task.service'
import { FunctionService } from 'src/function/function.service'
import { DatabaseService } from 'src/database/database.service'
import { MongoService } from 'src/database/mongo.service'

@Module({
  imports: [StorageModule, HttpModule],
  controllers: [TriggerController],
  providers: [
    TriggerService,
    JwtService,
    ApplicationService,
    CronJobService,
    TriggerTaskService,
    FunctionService,
    DatabaseService,
    MongoService,
  ],
  exports: [TriggerService, CronJobService],
})
export class TriggerModule {}
