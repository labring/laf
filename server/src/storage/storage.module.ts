import { Module } from '@nestjs/common'
import { BucketsController } from '../storage/buckets.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationsModule } from '../applications/applications.module'

@Module({
  imports: [CoreModule, ApplicationsModule],
  controllers: [BucketsController],
  providers: [],
})
export class StorageModule {}
