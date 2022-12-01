import { Injectable, Logger } from '@nestjs/common'
import { KubernetesService } from './kubernetes.service'
import {
  Application,
  ApplicationList,
  ApplicationSpec,
} from './api/application.cr'
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

  generateAppid(len: number) {
    const nano = nanoid.customAlphabet(
      '1234567890abcdefghijklmnopqrstuvwxyz',
      len || 6,
    )
    return nano()
  }

  async create(userid: string, appid: string, dto: CreateApplicationDto) {
    // create app resources
    const namespace = GetApplicationNamespaceById(appid)
    const app = new Application(appid, namespace)
    app.setUserId(userid)
    app.setDisplayName(dto.displayName)

    app.spec = new ApplicationSpec({
      appid,
      state: dto.state,
      region: dto.region,
      bundleName: dto.bundleName,
      runtimeName: dto.runtimeName,
    })

    try {
      const res = await this.k8sClient.objectApi.create(app)
      return Application.fromObject(res.body)
    } catch (error) {
      this.logger.error(error, error?.response.body)
      return null
    }
  }

  async findAll(labelSelector?: string): Promise<ApplicationList> {
    const res = await this.k8sClient.customObjectApi.listClusterCustomObject(
      Application.GVK.group,
      Application.GVK.version,
      Application.GVK.plural,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    )
    return ApplicationList.fromObject(res.body as any)
  }

  async findAllByUser(userid: string): Promise<ApplicationList> {
    const apps = await this.findAll(`${ResourceLabels.USER_ID}=${userid}`)
    return apps
  }

  async findOne(appid: string): Promise<Application> {
    const namespace = GetApplicationNamespaceById(appid)
    const name = appid

    // get app
    try {
      const res =
        await this.k8sClient.customObjectApi.getNamespacedCustomObject(
          Application.GVK.group,
          Application.GVK.version,
          namespace,
          Application.GVK.plural,
          name,
        )
      return Application.fromObject(res.body)
    } catch (err) {
      this.logger.error(err)
      if (err?.response?.body?.reason === 'NotFound') {
        return null
      }
      throw err
    }
  }

  async findOneByUser(userid: string, appid: string): Promise<Application> {
    const app = await this.findOne(appid)
    if (app?.metadata?.labels?.[ResourceLabels.USER_ID] === userid) {
      return Application.fromObject(app)
    }
    return null
  }

  async update(appid: string, dto: UpdateApplicationDto) {
    try {
      const app = await this.findOne(appid)
      if (dto.displayName) {
        app.setDisplayName(dto.displayName)
      }
      app.spec.state = dto.state || app.spec.state

      const res = await this.k8sClient.patchCustomObject(app)
      return res as Application
    } catch (err) {
      this.logger.error(err)
      return null
    }
  }

  async remove(appid: string) {
    try {
      const app = await this.findOne(appid)
      const res = await this.k8sClient.deleteCustomObject(app)
      return res
    } catch (error) {
      this.logger.error(error, error.response?.body)
      return null
    }
  }
}
