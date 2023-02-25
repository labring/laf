import { Module } from '@nestjs/common'
import { RegionService } from 'src/region/region.service'
import { MinioService } from 'src/storage/minio/minio.service'
import { InitializerService } from './initializer.service'

@Module({
  providers: [InitializerService, MinioService, RegionService],
})
export class InitializerModule {}
