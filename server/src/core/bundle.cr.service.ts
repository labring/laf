import { Injectable, Logger } from '@nestjs/common'
import { GetSystemNamespace } from '../common/getter'
import { KubernetesService } from '../core/kubernetes.service'
import { Bundle, BundleList } from './api/bundle.cr'

@Injectable()
export class BundleCoreService {
  private readonly logger = new Logger(BundleCoreService.name)
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
