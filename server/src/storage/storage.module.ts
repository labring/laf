import { Module } from '@nestjs/common'
import { BucketController } from './bucket.controller'
import { MinioService } from './minio/minio.service'
import { StorageService } from './storage.service'
import { ApplicationService } from 'src/application/application.service'
import { BucketService } from './bucket.service'
import { RegionModule } from 'src/region/region.module'
import { GatewayModule } from 'src/gateway/gateway.module'
import { BucketTaskService } from './bucket-task.service'

@Module({
  imports: [RegionModule, GatewayModule],
  controllers: [BucketController],
  providers: [
    MinioService,
    StorageService,
    ApplicationService,
    BucketService,
    BucketTaskService,
  ],
  exports: [StorageService, MinioService],
})
export class StorageModule {}
