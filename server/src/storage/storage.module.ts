import { Module } from '@nestjs/common'
import { BucketsController } from '../storage/buckets.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationModule } from '../application/application.module'
import { StorageService } from './storage.service'

@Module({
  imports: [CoreModule, ApplicationModule],
  controllers: [BucketsController],
  providers: [StorageService],
})
export class StorageModule {}
