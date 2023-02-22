import { Module } from '@nestjs/common'
import { RuntimeDomainService } from './runtime-domain.service'
import { ApisixService } from './apisix.service'
import { RegionModule } from 'src/region/region.module'
import { PrismaService } from 'src/prisma.service'
import { HttpModule } from '@nestjs/axios'
import { BucketDomainService } from './bucket-domain.service'
import { WebsiteTaskService } from './website-task.service'
import { BucketDomainTaskService } from './bucket-domain-task.service'
import { RuntimeDomainTaskService } from './runtime-domain-task.service'

@Module({
  imports: [RegionModule, HttpModule],
  providers: [
    RuntimeDomainService,
    ApisixService,
    PrismaService,
    BucketDomainService,
    WebsiteTaskService,
    BucketDomainTaskService,
    RuntimeDomainTaskService,
  ],
  exports: [RuntimeDomainService, BucketDomainService],
})
export class GatewayModule {}
