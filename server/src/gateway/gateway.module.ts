import { Module } from '@nestjs/common'
import { GatewayService } from './gateway.service'
import { ApisixService } from './apisix.service'
import { RegionModule } from 'src/region/region.module'
import { PrismaService } from 'src/prisma.service'

@Module({
  imports: [RegionModule],
  providers: [GatewayService, ApisixService, PrismaService],
  exports: [GatewayService],
})
export class GatewayModule {}
