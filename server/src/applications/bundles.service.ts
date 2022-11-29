import { Injectable, Logger } from '@nestjs/common'
import { GetSystemNamespace } from 'src/common/getter'
import { KubernetesService } from 'src/core/kubernetes.service'
import { Bundle, BundleList } from './entities/bundle.entity'

@Injectable()
export class BundlesService {
  private readonly logger = new Logger(BundlesService.name)
  constructor(private readonly k8sClient: KubernetesService) {}

  async findAll() {
    const namespace = GetSystemNamespace()
    const api = this.k8sClient.customObjectApi
    const res = await api.listNamespacedCustomObject(
      Bundle.GVK.group,
      Bundle.GVK.version,
      namespace,
      Bundle.GVK.plural,
    )

    return BundleList.fromObject(res.body as any)
  }
}
