import { Module } from '@nestjs/common'
import { BucketController } from './bucket.controller'
import { CoreModule } from '../core/core.module'
import { ApplicationModule } from '../application/application.module'
import { StorageService } from './storage.service'
import { GatewayCoreService } from 'src/core/gateway.cr.service'

@Module({
  imports: [CoreModule, ApplicationModule],
  controllers: [BucketController],
  providers: [StorageService, GatewayCoreService],
})
export class StorageModule {}
