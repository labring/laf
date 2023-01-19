import { Module } from '@nestjs/common'
import { FunctionDomainService } from './function-domain.service'
import { ApisixService } from './apisix.service'
import { RegionModule } from 'src/region/region.module'
import { PrismaService } from 'src/prisma.service'
import { HttpModule } from '@nestjs/axios'
import { BucketDomainService } from './bucket-domain.service'

@Module({
  imports: [RegionModule, HttpModule],
  providers: [
    FunctionDomainService,
    ApisixService,
    PrismaService,
    BucketDomainService,
  ],
  exports: [FunctionDomainService, BucketDomainService],
})
export class GatewayModule {}
