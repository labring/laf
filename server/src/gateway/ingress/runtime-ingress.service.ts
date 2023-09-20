import { V1Ingress } from '@kubernetes/client-node'
import { Injectable, Logger } from '@nestjs/common'
import { LABEL_KEY_APP_ID } from 'src/constants'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { GetApplicationNamespace } from 'src/utils/getter'
import { RuntimeDomain } from '../entities/runtime-domain'

@Injectable()
export class RuntimeGatewayService {
  private readonly logger = new Logger(RuntimeGatewayService.name)
  constructor(private readonly clusterService: ClusterService) {}

  async getIngress(region: Region, appid: string) {
    // get ingress
    const namespace = GetApplicationNamespace(region, appid)

    // use appid as ingress name of runtime directly
    const name = `${appid}`

    const ingress = await this.clusterService.getIngress(
      region,
      name,
      namespace,
    )

    return ingress
  }

  async createIngress(region: Region, runtimeDomain: RuntimeDomain) {
    const appid = runtimeDomain.appid
    const namespace = GetApplicationNamespace(region, appid)

    // use appid as ingress name of runtime directly
    const name = `${appid}`
    const hosts = [runtimeDomain.domain]
    if (runtimeDomain.customDomain) {
      hosts.push(runtimeDomain.customDomain)
    }

    // build rules
    const backend = { service: { name: `${appid}`, port: { number: 8000 } } }
    const rules = hosts.map((host) => {
      return {
        host,
        http: { paths: [{ path: '/', pathType: 'Prefix', backend }] },
      }
    })

    // build tls
    const tls = []
    if (runtimeDomain.customDomain) {
      tls.push({ secretName: `${appid}`, hosts: [runtimeDomain.customDomain] })
    }

    // create ingress
    const ingressClassName = region.gatewayConf.driver
    const ingressBody: V1Ingress = {
      metadata: {
        name,
        namespace,
        annotations: {
          [LABEL_KEY_APP_ID]: appid,
          'laf.dev/ingress.type': 'runtime',
          // apisix ingress annotations
          'k8s.apisix.apache.org/enable-websocket': 'true',
          'k8s.apisix.apache.org/enable-cors': 'true',
          'k8s.apisix.apache.org/cors-allow-credential': 'false',
          'k8s.apisix.apache.org/cors-allow-headers': '*',
          'k8s.apisix.apache.org/cors-allow-methods': '*',
          'k8s.apisix.apache.org/cors-allow-origin': '*',
          'k8s.apisix.apache.org/cors-expose-headers': '*',
          'k8s.apisix.apache.org/svc-namespace': namespace,

          // k8s nginx ingress annotations
          // websocket is enabled by default in k8s nginx ingress
          'nginx.ingress.kubernetes.io/enable-cors': 'true',
          'nginx.ingress.kubernetes.io/cors-allow-credentials': 'true',
          'nginx.ingress.kubernetes.io/cors-allow-methods': '*',
          'nginx.ingress.kubernetes.io/cors-allow-headers': '*',
          'nginx.ingress.kubernetes.io/cors-expose-headers': '*',
          'nginx.ingress.kubernetes.io/cors-allow-origin': '*',
        },
      },
      spec: { ingressClassName, rules, tls },
    }

    const res = await this.clusterService.createIngress(region, ingressBody)
    return res
  }

  async deleteIngress(region: Region, appid: string) {
    const ingress = await this.getIngress(region, appid)
    if (!ingress) return

    const name = ingress.metadata.name
    const namespace = ingress.metadata.namespace

    // delete ingress
    const res = await this.clusterService.deleteIngress(region, name, namespace)
    return res
  }
}
