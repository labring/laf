import { Injectable, Logger } from '@nestjs/common'
import { KubernetesService } from '../core/kubernetes.service'
import {
  Application,
  ApplicationList,
  ApplicationSpec,
} from './entities/application.entity'
import * as k8s from '@kubernetes/client-node'
import * as nanoid from 'nanoid'
import { CreateApplicationDto } from './dto/create-application.dto'
import { UpdateApplicationDto } from './dto/update-application.dto'
import { ResourceLabels } from '../constants'
import { GetApplicationNamespaceById } from '../common/getter'

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name)
  constructor(public k8sClient: KubernetesService) {}

  // create app namespace
  async createAppNamespace(appid: string, userid: string) {
    try {
      const namespace = new k8s.V1Namespace()
      namespace.metadata = new k8s.V1ObjectMeta()
      namespace.metadata.name = appid
      namespace.metadata.labels = {
        [ResourceLabels.APP_ID]: appid,
        [ResourceLabels.NAMESPACE_TYPE]: 'app',
        [ResourceLabels.USER_ID]: userid,
      }
      const res = await this.k8sClient.coreV1Api.createNamespace(namespace)
      return res.body
    } catch (err) {
      this.logger.error(err)
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
    const app = new Application(dto.name, namespace)
    app.setUserId(userid)

    app.spec = new ApplicationSpec({
      appid,
      state: dto.state,
      region: dto.region,
      bundleName: dto.bundleName,
      runtimeName: dto.runtimeName,
    })

    try {
      const res = await this.k8sClient.objectApi.create(app)
      return res.body
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
    return res.body as ApplicationList
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
      const appRes =
        await this.k8sClient.customObjectApi.getNamespacedCustomObject(
          Application.GVK.group,
          Application.GVK.version,
          namespace,
          Application.GVK.plural,
          name,
        )
      return appRes.body as Application
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
      return app
    }
    return null
  }

  update(id: number, dto: UpdateApplicationDto) {
    return `This action updates a #${id} app`
  }

  remove(id: number) {
    return `This action removes a #${id} app`
  }
}
