import { Injectable, Logger } from '@nestjs/common'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { BucketDomain } from '../entities/bucket-domain'
import { GetApplicationNamespace } from 'src/utils/getter'
import { V1Ingress, V1IngressRule } from '@kubernetes/client-node'
import { LABEL_KEY_APP_ID } from 'src/constants'

@Injectable()
export class BucketGatewayService {
  private readonly logger = new Logger(BucketGatewayService.name)
  constructor(private readonly clusterService: ClusterService) {}

  getIngressName(bucketDomain: BucketDomain) {
    return bucketDomain._id.toString()
  }

  async getIngress(region: Region, domain: BucketDomain) {
    const namespace = GetApplicationNamespace(region, domain.appid)
    const name = this.getIngressName(domain)

    const ingress = await this.clusterService.getIngress(
      region,
      name,
      namespace,
    )

    return ingress
  }

  async createIngress(region: Region, domain: BucketDomain) {
    const appid = domain.appid
    const namespace = GetApplicationNamespace(region, appid)
    const name = this.getIngressName(domain)

    // all bucket request should proxy through runtime
    const backend = { service: { name: `${appid}`, port: { number: 9000 } } }

    // build minio endpoint rule
    const minioUrl = new URL(region.storageConf.externalEndpoint)
    const minioEndpointHost = minioUrl.host
    const minioRule: V1IngressRule = {
      host: minioEndpointHost,
      http: {
        paths: [{ path: `/${domain.bucketName}`, pathType: 'Prefix', backend }],
      },
    }

    // build bucket host rule
    // @deprecated  only use minio endpoint host in the future, reserved to compatible with old version
    const bucketHost = domain.domain
    const bucketRule: V1IngressRule = {
      host: bucketHost,
      http: {
        paths: [{ path: '/', pathType: 'Prefix', backend }],
      },
    }

    // create ingress
    const ingressClassName = region.gatewayConf.driver
    const ingressBody: V1Ingress = {
      metadata: {
        name,
        namespace,
        annotations: {
          [LABEL_KEY_APP_ID]: appid,
          'laf.dev/bucket.name': domain.bucketName,
          'laf.dev/ingress.type': 'bucket',
          // apisix ingress annotations
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
          'nginx.ingress.kubernetes.io/cors-allow-headers':
            'DNT,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,x-laf-develop-token,x-laf-func-data,x-amz-content-sha256,x-amz-security-token,x-amz-user-agent,x-amz-date',
          'nginx.ingress.kubernetes.io/cors-expose-headers': '*',
          'nginx.ingress.kubernetes.io/cors-allow-origin': '*',
        },
      },
      spec: { ingressClassName, rules: [minioRule, bucketRule] },
    }

    const res = await this.clusterService.createIngress(region, ingressBody)
    return res
  }

  async deleteIngress(region: Region, domain: BucketDomain) {
    const namespace = GetApplicationNamespace(region, domain.appid)
    const name = this.getIngressName(domain)

    const res = await this.clusterService.deleteIngress(region, name, namespace)
    return res
  }
}
