import { V1PodList } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { RegionService } from 'src/region/region.service'
import { GetApplicationNamespace } from 'src/utils/getter'
import http from 'http'
import { PodNamesDto } from './dto/pod.dto'

@Injectable()
export class PodService {
  private readonly logger = new Logger(PodService.name)

  constructor(
    private readonly regionService: RegionService,
    private readonly cluster: ClusterService,
  ) {}
  async getPodNameByAppid(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    const namespaceOfApp = GetApplicationNamespace(region, appid)
    const coreV1Api = this.cluster.makeCoreV1Api(region)
    const res: { response: http.IncomingMessage; body: V1PodList } =
      await coreV1Api.listNamespacedPod(
        namespaceOfApp,
        undefined,
        undefined,
        undefined,
        undefined,
        `app=${appid}`,
      )
    const podNames: PodNamesDto = { appid: appid, pods: [] }
    for (const item of res.body.items) {
      podNames.pods.push(item.metadata.name)
    }
    return podNames
  }
}
