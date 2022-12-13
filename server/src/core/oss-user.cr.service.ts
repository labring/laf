import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../utils/getter'
import { KubernetesService } from './kubernetes.service'
import * as assert from 'node:assert'
import { Bundle, Application } from '@prisma/client'
import { MB, ResourceLabels } from '../constants'
import { GenerateAlphaNumericPassword } from '../utils/random'
import { toQuantityString } from '../utils/types'
import { OSSUser } from './api/oss-user.cr'

@Injectable()
export class OSSUserCoreService {
  private readonly logger = new Logger(OSSUserCoreService.name)

  constructor(private readonly k8sService: KubernetesService) {}

  /**
   * Create app oss user
   * @param app
   * @param bundle
   * @returns
   */
  async create(app: Application, bundle: Bundle) {
    const appid = app.appid
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    const user = new OSSUser(name, namespace)
    user.metadata.labels = {
      [ResourceLabels.APP_ID]: appid,
    }

    user.spec.provider = 'minio'
    user.spec.region = app.regionName
    user.spec.appid = appid
    user.spec.password = GenerateAlphaNumericPassword(64)
    user.spec.capacity.storage = toQuantityString(bundle.storageCapacity * MB)

    try {
      const res = await this.k8sService.objectApi.create(user)
      return OSSUser.fromObject(res.body)
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  /**
   * Get the oss user of an app
   * @param appid
   * @returns
   */
  async findOne(appid: string) {
    assert(appid, 'appid is required')
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid
    try {
      const res =
        await this.k8sService.customObjectApi.getNamespacedCustomObject(
          OSSUser.GVK.group,
          OSSUser.GVK.version,
          namespace,
          OSSUser.GVK.plural,
          name,
        )
      return OSSUser.fromObject(res.body)
    } catch (err) {
      if (err?.response?.body?.reason === 'NotFound') return null
      this.logger.error(err)
      this.logger.debug(err.response?.body)
      return null
    }
  }

  async remove(user: OSSUser) {
    try {
      const res = await this.k8sService.deleteCustomObject(user)
      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }
}
