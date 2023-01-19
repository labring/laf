import { Module } from '@nestjs/common'
import { BucketController } from './bucket.controller'
import { MinioService } from './minio/minio.service'
import { StorageService } from './storage.service'
import { PrismaService } from 'src/prisma.service'
import { ApplicationService } from 'src/application/application.service'
import { BucketService } from './bucket.service'
import { RegionModule } from 'src/region/region.module'
import { GatewayModule } from 'src/gateway/gateway.module'

@Module({
  imports: [RegionModule, GatewayModule],
  controllers: [BucketController],
  providers: [
    MinioService,
    StorageService,
    PrismaService,
    ApplicationService,
    BucketService,
  ],
  exports: [StorageService, MinioService],
})
export class StorageModule {}
