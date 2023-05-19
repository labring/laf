import { Global, Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { ClusterService } from './cluster/cluster.service'
import { ResourceService } from './resource.service'

@Global()
@Module({
  providers: [RegionService, ClusterService, ResourceService],
  controllers: [RegionController],
  exports: [RegionService, ClusterService],
})
export class RegionModule {}
