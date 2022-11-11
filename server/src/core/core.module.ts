import { Global, Module } from '@nestjs/common'
import { KubernetesService } from './kubernetes.service'

@Global()
@Module({
  providers: [KubernetesService],
  exports: [KubernetesService],
})
export class CoreModule {}
