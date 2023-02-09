import { Module } from '@nestjs/common'
import { FunctionDomainService } from './function-domain.service'
import { ApisixService } from './apisix.service'
import { RegionModule } from 'src/region/region.module'
import { PrismaService } from 'src/prisma.service'
import { HttpModule } from '@nestjs/axios'
import { BucketDomainService } from './bucket-domain.service'
import { WebsiteTaskService } from './website-task.service'
import { BucketDomainTaskService } from './bucket-domain-task.service'
import { FunctionDomainTaskService } from './function-domain-task.service'

@Module({
  imports: [RegionModule, HttpModule],
  providers: [
    FunctionDomainService,
    ApisixService,
    PrismaService,
    BucketDomainService,
    WebsiteTaskService,
    BucketDomainTaskService,
    FunctionDomainTaskService,
  ],
  exports: [FunctionDomainService, BucketDomainService],
})
export class GatewayModule {}
