import { Injectable, Logger } from '@nestjs/common'
import { GetSystemNamespace } from 'src/common/getter'
import { KubernetesService } from 'src/core/kubernetes.service'
import { Runtime, RuntimeList } from './entities/runtime.entity'

@Injectable()
export class RuntimesService {
  private readonly logger = new Logger(RuntimesService.name)
  constructor(private readonly k8sClient: KubernetesService) {}

  async findAll() {
    const namespace = GetSystemNamespace()
    const api = this.k8sClient.customObjectApi
    const res = await api.listNamespacedCustomObject(
      Runtime.GVK.group,
      Runtime.GVK.version,
      namespace,
      Runtime.GVK.plural,
    )

    return RuntimeList.fromObject(res.body as any)
  }
}
