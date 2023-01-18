import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../utils/getter'
import * as assert from 'node:assert'
import { ResourceLabels } from '../constants'
import { Gateway } from './api/gateway.cr'
import { ClusterService } from '../region/cluster/cluster.service'
import { RegionService } from '../region/region.service'

@Injectable()
export class GatewayCoreService {
  private readonly logger = new Logger(GatewayCoreService.name)

  constructor(
    private readonly clusterService: ClusterService,
    private readonly regionService: RegionService,
  ) {}

  async create(appid: string) {
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    const gw = new Gateway(name, namespace)
    gw.metadata.labels = {
      [ResourceLabels.APP_ID]: appid,
    }

    gw.spec.appid = appid
    gw.spec.buckets = []

    const region = await this.regionService.findByAppId(appid)
    const objectApi = this.clusterService.makeObjectApi(region)

    try {
      const res = await objectApi.create(gw)
      return Gateway.fromObject(res.body)
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  async findOne(appid: string) {
    assert(appid, 'appid is required')
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    const region = await this.regionService.findByAppId(appid)
    const customObjectApi = this.clusterService.makeCustomObjectApi(region)
    try {
      const res = await customObjectApi.getNamespacedCustomObject(
        Gateway.GVK.group,
        Gateway.GVK.version,
        namespace,
        Gateway.GVK.plural,
        name,
      )
      return Gateway.fromObject(res.body)
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.debug(err.response?.body)
      return null
    }
  }
}
