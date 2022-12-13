import { Module } from '@nestjs/common'
import { BucketController } from './bucket.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationModule } from '../application/application.module'
import { StorageService } from './storage.service'

@Module({
  imports: [CoreModule, ApplicationModule],
  controllers: [BucketController],
  providers: [StorageService],
})
export class StorageModule {}
