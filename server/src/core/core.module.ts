import { Global, Module } from '@nestjs/common'
import { ApplicationCoreService } from './application.cr.service'
import { GatewayCoreService } from './gateway.cr.service'
import { KubernetesService } from './kubernetes.service'

@Global()
@Module({
  providers: [KubernetesService, ApplicationCoreService, GatewayCoreService],
  exports: [KubernetesService, ApplicationCoreService, GatewayCoreService],
})
export class CoreModule {}
