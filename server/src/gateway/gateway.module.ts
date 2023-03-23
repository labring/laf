import { Module } from '@nestjs/common'
import { RuntimeDomainService } from './runtime-domain.service'
import { ApisixService } from './apisix.service'
import { HttpModule } from '@nestjs/axios'
import { BucketDomainService } from './bucket-domain.service'
import { WebsiteTaskService } from './website-task.service'
import { BucketDomainTaskService } from './bucket-domain-task.service'
import { RuntimeDomainTaskService } from './runtime-domain-task.service'
import { ApisixCrdService } from './apisix-crd.service';

@Module({
  imports: [HttpModule],
  providers: [
    RuntimeDomainService,
    ApisixService,
    BucketDomainService,
    WebsiteTaskService,
    BucketDomainTaskService,
    RuntimeDomainTaskService,
    ApisixCrdService,
  ],
  exports: [RuntimeDomainService, BucketDomainService],
})
export class GatewayModule {}
