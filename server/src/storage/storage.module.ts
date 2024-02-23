import { Module } from '@nestjs/common'
import { BucketController } from './bucket.controller'
import { MinioService } from './minio/minio.service'
import { StorageService } from './storage.service'
import { ApplicationService } from 'src/application/application.service'
import { BucketService } from './bucket.service'
import { GatewayModule } from 'src/gateway/gateway.module'
import { BucketTaskService } from './bucket-task.service'
import { BundleService } from 'src/application/bundle.service'
import { StorageUsageCaptureTaskService } from './storage-usage-capture-task.service'
import { StorageUsageLimitTaskService } from './storage-usage-limit-task.service'
import { CloudBinBucketService } from './cloud-bin-bucket.service'
import { StorageUserTaskService } from './storage-user-task.service'

@Module({
  imports: [GatewayModule],
  controllers: [BucketController],
  providers: [
    MinioService,
    StorageService,
    ApplicationService,
    BucketService,
    BucketTaskService,
    BundleService,
    StorageUsageCaptureTaskService,
    StorageUsageLimitTaskService,
    StorageUserTaskService,
    CloudBinBucketService,
  ],
  exports: [StorageService, MinioService, BucketService, CloudBinBucketService],
})
export class StorageModule {}
