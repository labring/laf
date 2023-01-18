import { Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { PrismaService } from '../prisma.service'
import { ClusterService } from './cluster/cluster.service'

@Module({
  providers: [RegionService, PrismaService, ClusterService],
  controllers: [RegionController],
  exports: [RegionService, ClusterService],
})
export class RegionModule {}
