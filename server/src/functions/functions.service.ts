import { Injectable, Logger } from '@nestjs/common'
import { GetApplicationNamespaceById } from 'src/common/getter'
import { KubernetesService } from 'src/core/kubernetes.service'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import { CloudFunction } from './entities/function.entity'

@Injectable()
export class FunctionsService {
  private logger = new Logger(FunctionsService.name)

  constructor(private readonly k8sClient: KubernetesService) {}

  async create(appid: string, dto: CreateFunctionDto) {
    const namespace = GetApplicationNamespaceById(appid)
    const func = new CloudFunction(dto.name, namespace)
    func.spec.description = dto.description
    func.spec.methods = dto.methods
    func.spec.source.codes = dto.codes
    func.spec.websocket = dto.websocket

    try {
      const res = await this.k8sClient.objectApi.create(func)
      return res.body
    } catch (error) {
      this.logger.error(error, error?.response.body)
      return null
    }
  }

  findAll() {
    return `This action returns all functions`
  }

  findOne(id: number) {
    return `This action returns a #${id} function`
  }

  update(id: number, updateFunctionDto: UpdateFunctionDto) {
    return `This action updates a #${id} function`
  }

  remove(id: number) {
    return `This action removes a #${id} function`
  }
}
