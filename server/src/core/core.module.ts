import { Global, Module } from '@nestjs/common'
import { ApplicationCoreService } from './application.cr.service'
import { BucketCoreService } from './bucket.cr.service'
import { DatabaseCoreService } from './database.cr.service'
import { GatewayCoreService } from './gateway.cr.service'
import { KubernetesService } from './kubernetes.service'

@Global()
@Module({
  providers: [
    KubernetesService,
    ApplicationCoreService,
    BucketCoreService,
    DatabaseCoreService,
    GatewayCoreService,
  ],
  exports: [
    KubernetesService,
    ApplicationCoreService,
    BucketCoreService,
    DatabaseCoreService,
    GatewayCoreService,
  ],
})
export class CoreModule {}
