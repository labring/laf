import { Injectable, Logger } from '@nestjs/common'
import { GetSystemNamespace } from '../common/getter'
import { KubernetesService } from '../core/kubernetes.service'
import { Runtime, RuntimeList } from './api/runtime.cr'

@Injectable()
export class RuntimeCoreService {
  private readonly logger = new Logger(RuntimeCoreService.name)
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
