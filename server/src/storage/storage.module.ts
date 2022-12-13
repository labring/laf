import { Module } from '@nestjs/common'
import { BucketsController } from '../storage/buckets.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsModule } from '../application/applications.module'
import { StorageService } from './storage.service'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [BucketsController],
  providers: [StorageService],
})
export class StorageModule {}
