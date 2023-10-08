import { V1Ingress, V1IngressRule } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { LABEL_KEY_APP_ID } from 'src/constants'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { GetApplicationNamespace } from 'src/utils/getter'
import { WebsiteHosting } from 'src/website/entities/website'

@Injectable()
export class WebsiteHostingGatewayService {
  private readonly logger = new Logger(WebsiteHostingGatewayService.name)

  constructor(private readonly clusterService: ClusterService) {}

  getIngressName(websiteHosting: WebsiteHosting) {
    return websiteHosting._id.toString()
  }

  async getIngress(region: Region, website: WebsiteHosting) {
    const namespace = GetApplicationNamespace(region, website.appid)
    const name = this.getIngressName(website)

    const ingress = await this.clusterService.getIngress(
      region,
      name,
      namespace,
    )

    return ingress
  }

  async createIngress(region: Region, website: WebsiteHosting) {
    const appid = website.appid
    const namespace = GetApplicationNamespace(region, appid)
    const name = this.getIngressName(website)

    // all bucket request should proxy through runtime
    const backend = { service: { name: `${appid}`, port: { number: 9000 } } }

    // build ingress rule
    const websiteHost = website.domain
    const rule: V1IngressRule = {
      host: websiteHost,
      http: { paths: [{ path: '/', pathType: 'Prefix', backend }] },
    }

    // create ingress
    const ingressClassName = region.gatewayConf.driver
    const ingressBody: V1Ingress = {
      metadata: {
        name,
        namespace,
        annotations: {
          [LABEL_KEY_APP_ID]: appid,
          'laf.dev/bucket.name': website.bucketName,
          'laf.dev/ingress.type': 'website',
          // apisix ingress annotations
          'k8s.apisix.apache.org/enable-cors': 'true',
          'k8s.apisix.apache.org/svc-namespace': namespace,

          // k8s nginx ingress annotations
          'nginx.ingress.kubernetes.io/enable-cors': 'true',
        },
      },
      spec: { ingressClassName, rules: [rule] },
    }

    const res = await this.clusterService.createIngress(region, ingressBody)
    return res
  }

  async deleteIngress(region: Region, website: WebsiteHosting) {
    const namespace = GetApplicationNamespace(region, website.appid)
    const name = this.getIngressName(website)

    const res = await this.clusterService.deleteIngress(region, name, namespace)
    return res
  }
}
