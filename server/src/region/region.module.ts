import { Global, Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { ClusterService } from './cluster/cluster.service'
import { BundleService } from './bundle.service'

@Global()
@Module({
  providers: [RegionService, ClusterService, BundleService],
  controllers: [RegionController],
  exports: [RegionService, ClusterService, BundleService],
})
export class RegionModule {}
