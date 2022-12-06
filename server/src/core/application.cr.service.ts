import { Injectable, Logger } from '@nestjs/common'
import { KubernetesService } from './kubernetes.service'
import * as k8s from '@kubernetes/client-node'
import * as nanoid from 'nanoid'
import { ResourceLabels } from '../constants'
import { GetApplicationNamespaceById } from '../common/getter'
import { CreateApplicationDto } from '../applications/dto/create-application.dto'
import { UpdateApplicationDto } from '../applications/dto/update-application.dto'

@Injectable()
export class ApplicationCoreService {
  private readonly logger = new Logger(ApplicationCoreService.name)
  constructor(public k8sClient: KubernetesService) {}

  // create app namespace
  async createAppNamespace(appid: string, userid: string) {
    try {
      const namespace = new k8s.V1Namespace()
      namespace.metadata = new k8s.V1ObjectMeta()
      namespace.metadata.name = GetApplicationNamespaceById(appid)
      namespace.metadata.labels = {
        [ResourceLabels.APP_ID]: appid,
        [ResourceLabels.NAMESPACE_TYPE]: 'app',
        [ResourceLabels.USER_ID]: userid,
      }
      const res = await this.k8sClient.coreV1Api.createNamespace(namespace)
      return res.body
    } catch (err) {
      this.logger.error(err, err?.response?.body)
      return null
    }
  }

  // remove app namespace
  async removeAppNamespace(appid: string) {
    try {
      const namespace = GetApplicationNamespaceById(appid)
      const res = await this.k8sClient.coreV1Api.deleteNamespace(namespace)
      return res
    } catch (err) {
      this.logger.error(err, err?.response?.body)
      return null
    }
  }

  generateAppid(len: number) {
    const nano = nanoid.customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyz',
      len || 6,
    )
    return nano()
  }
}
