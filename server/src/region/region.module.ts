import { Global, Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { ClusterService } from './cluster/cluster.service'
import { ResourceOptionService } from './resource-option.service'

@Global()
@Module({
  providers: [RegionService, ClusterService, ResourceOptionService],
  controllers: [RegionController],
  exports: [RegionService, ClusterService],
})
export class RegionModule {}
