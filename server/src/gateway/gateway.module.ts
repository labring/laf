import { Module } from '@nestjs/common'
import { RuntimeDomainService } from './runtime-domain.service'
import { HttpModule } from '@nestjs/axios'
import { BucketDomainService } from './bucket-domain.service'
import { WebsiteTaskService } from './website-task.service'
import { BucketDomainTaskService } from './bucket-domain-task.service'
import { RuntimeDomainTaskService } from './runtime-domain-task.service'
import { CertificateService } from './certificate.service'
import { RuntimeGatewayService } from './ingress/runtime-ingress.service'
import { BucketGatewayService } from './ingress/bucket-ingress.service'
import { WebsiteHostingGatewayService } from './ingress/website-ingress.service'
import { DatabaseModule } from 'src/database/database.module'

@Module({
  imports: [HttpModule, DatabaseModule],
  providers: [
    RuntimeDomainService,
    BucketDomainService,
    WebsiteTaskService,
    BucketDomainTaskService,
    RuntimeDomainTaskService,
    CertificateService,
    RuntimeGatewayService,
    BucketGatewayService,
    WebsiteHostingGatewayService,
  ],
  exports: [RuntimeDomainService, BucketDomainService],
})
export class GatewayModule {}
