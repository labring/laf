import { Injectable, Logger } from '@nestjs/common'
import { ClusterService } from 'src/region/cluster/cluster.service'
import { Region } from 'src/region/entities/region'
import { BucketDomain } from '../entities/bucket-domain'
import { GetApplicationNamespace } from 'src/utils/getter'

@Injectable()
export class BucketGateway {
  private readonly logger = new Logger(BucketGateway.name)
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

    const hosts = [domain.domain]

    // build rules
    const backend = { service: { name: `${appid}`, port: { number: 8000 } } }
    const rules = hosts.map((host) => {
      return {
        host,
        http: { paths: [{ path: '/', pathType: 'Prefix', backend }] },
      }
    })
  }
}
