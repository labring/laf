import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../common/getter'
import { KubernetesService } from './kubernetes.service'
import * as assert from 'node:assert'
import { ResourceLabels } from 'src/constants'
import { Gateway } from './api/gateway.cr'

@Injectable()
export class GatewayCoreService {
  private readonly logger = new Logger(GatewayCoreService.name)

  constructor(private readonly k8sService: KubernetesService) {}

  async create(appid: string) {
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    const gw = new Gateway(name, namespace)
    gw.metadata.labels = {
      [ResourceLabels.APP_ID]: appid,
    }

    gw.spec.appid = appid

    try {
      const res = await this.k8sService.objectApi.create(gw)
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
    try {
      const res =
        await this.k8sService.customObjectApi.getNamespacedCustomObject(
          Gateway.GVK.group,
          Gateway.GVK.version,
          namespace,
          Gateway.GVK.plural,
          name,
        )
      return Gateway.fromObject(res.body)
    } catch (err) {
      this.logger.error(err)
      if (err?.response?.body?.reason === 'NotFound') {
        return null
      }
      throw err
    }
  }

  async remove(user: Gateway) {
    try {
      const res = await this.k8sService.deleteCustomObject(user)
      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }
}
