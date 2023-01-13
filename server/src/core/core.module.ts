import { Global, Module } from '@nestjs/common'
import { ApplicationCoreService } from './application.cr.service'
import { DatabaseCoreService } from './database.cr.service'
import { GatewayCoreService } from './gateway.cr.service'
import { KubernetesService } from './kubernetes.service'

@Global()
@Module({
  providers: [
    KubernetesService,
    ApplicationCoreService,
    DatabaseCoreService,
    GatewayCoreService,
  ],
  exports: [
    KubernetesService,
    ApplicationCoreService,
    DatabaseCoreService,
    GatewayCoreService,
  ],
})
export class CoreModule {}
