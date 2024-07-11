import { Injectable, Logger } from '@nestjs/common'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { BucketDomain } from '../entities/bucket-domain'
import { GetApplicationNamespace } from 'src/utils/getter'
import { V1Ingress, V1IngressRule, V1IngressTLS } from '@kubernetes/client-node'
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
    const minioEndpointHost = minioUrl.hostname
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

    // build tls
    const tls: Array<V1IngressTLS> = []
    const tlsConf = region.gatewayConf.tls
    if (tlsConf.enabled && tlsConf.wildcardCertificateSecretName) {
      // add wildcardDomain tls
      const secretName = region.gatewayConf.tls.wildcardCertificateSecretName
      tls.push({ secretName, hosts: [minioEndpointHost, bucketHost] })
    }

    // create ingress
    const ingressClassName = region.gatewayConf.driver
    const ingressBody: V1Ingress = {
      metadata: {
        name,
        namespace,
        labels: {
          [LABEL_KEY_APP_ID]: appid,
          'laf.dev/bucket.name': domain.bucketName,
          'laf.dev/ingress.type': 'bucket',
        },
        annotations: {
          // apisix ingress annotations
          'k8s.apisix.apache.org/cors-expose-headers': '*',

          // k8s nginx ingress annotations
          // websocket is enabled by default in k8s nginx ingress
          'nginx.ingress.kubernetes.io/proxy-body-size': '0',
        },
      },
      spec: { ingressClassName, rules: [minioRule, bucketRule], tls },
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
