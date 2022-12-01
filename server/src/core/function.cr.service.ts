import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from '../common/getter'
import { KubernetesService } from './kubernetes.service'
import { CreateFunctionDto } from '../functions/dto/create-function.dto'
import { UpdateFunctionDto } from '../functions/dto/update-function.dto'
import { CloudFunction, CloudFunctionList } from './api/function.cr'

@Injectable()
export class FunctionCoreService {
  private logger = new Logger(FunctionCoreService.name)

  constructor(private readonly k8sClient: KubernetesService) {}

  /**
   * Create a new function
   * @param appid
   * @param dto
   * @returns
   */
  async create(appid: string, dto: CreateFunctionDto) {
    const namespace = GetApplicationNamespaceById(appid)
    const func = new CloudFunction(dto.name, namespace)
    func.spec.description = dto.description
    func.spec.methods = dto.methods
    func.spec.source.codes = dto.codes
    func.spec.websocket = dto.websocket

    try {
      const res = await this.k8sClient.objectApi.create(func)
      return CloudFunction.fromObject(res.body)
    } catch (error) {
      this.logger.error(error, error?.response?.body)
      return null
    }
  }

  /**
   * Query functions of a app
   * @param appid
   * @param labelSelector
   * @returns
   */
  async findAll(appid: string, labelSelector?: string) {
    const namespace = GetApplicationNamespaceById(appid)
    const res = await this.k8sClient.customObjectApi.listNamespacedCustomObject(
      CloudFunction.GVK.group,
      CloudFunction.GVK.version,
      namespace,
      CloudFunction.GVK.plural,
      undefined,
      undefined,
      undefined,
      labelSelector,
    )

    return CloudFunctionList.fromObject(res.body as any)
  }

  /**
   * Find a function by name
   * @param appid
   * @param name
   * @returns
   */
  async findOne(appid: string, name: string) {
    const namespace = GetApplicationNamespaceById(appid)
    try {
      const res =
        await this.k8sClient.customObjectApi.getNamespacedCustomObject(
          CloudFunction.GVK.group,
          CloudFunction.GVK.version,
          namespace,
          CloudFunction.GVK.plural,
          name,
        )
      return CloudFunction.fromObject(res.body)
    } catch (err) {
      this.logger.error(err)
      if (err?.response?.body?.reason === 'NotFound') {
        return null
      }
      throw err
    }
  }

  async update(func: CloudFunction, dto: UpdateFunctionDto) {
    if (dto.description) {
      func.spec.description = dto.description
    }
    if (dto.methods) {
      func.spec.methods = dto.methods
    }
    if (dto.codes) {
      func.spec.source.codes = dto.codes
    }
    if (dto.websocket) {
      func.spec.websocket = dto.websocket
    }

    try {
      const res = await this.k8sClient.patchCustomObject(func)
      return CloudFunction.fromObject(res)
    } catch (error) {
      this.logger.error(error, error?.response?.body)
      return null
    }
  }

  async remove(func: CloudFunction) {
    try {
      const res = await this.k8sClient.deleteCustomObject(func)
      return CloudFunction.fromObject(res)
    } catch (error) {
      this.logger.error(error, error?.response?.body)
      return null
    }
  }
}
