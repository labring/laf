import { Module } from '@nestjs/common'
import { GatewayService } from './gateway.service'
import { ApisixService } from './apisix.service'
import { RegionModule } from 'src/region/region.module'
import { PrismaService } from 'src/prisma.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [RegionModule, HttpModule],
  providers: [GatewayService, ApisixService, PrismaService],
  exports: [GatewayService],
})
export class GatewayModule {}
