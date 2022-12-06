import { Global, Module } from '@nestjs/common'
import { ApplicationCoreService } from './application.cr.service'
import { BucketCoreService } from './bucket.cr.service'
import { DatabaseCoreService } from './database.cr.service'
import { GatewayCoreService } from './gateway.cr.service'
import { KubernetesService } from './kubernetes.service'
import { OSSUserCoreService } from './oss-user.cr.service'

@Global()
@Module({
  providers: [
    KubernetesService,
    ApplicationCoreService,
    BucketCoreService,
    DatabaseCoreService,
    OSSUserCoreService,
    GatewayCoreService,
  ],
  exports: [
    KubernetesService,
    ApplicationCoreService,
    BucketCoreService,
    DatabaseCoreService,
    OSSUserCoreService,
    GatewayCoreService,
  ],
})
export class CoreModule {}
