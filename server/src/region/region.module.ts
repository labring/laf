import { Module } from '@nestjs/common'
import { RegionService } from './region.service'
import { RegionController } from './region.controller'
import { PrismaService } from '../prisma.service'

@Module({
  providers: [RegionService, PrismaService],
  controllers: [RegionController],
  exports: [RegionService],
})
export class RegionModule {}
