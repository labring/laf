import { Injectable } from '@nestjs/common'
import { ResponseUtil } from '../utils/response'
import { KubernetesService } from '../core/kubernetes.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import { Application, ApplicationSpec } from './entities/app.entity'

@Injectable()
export class AppsService {
  constructor(public k8sClient: KubernetesService) {}

  async create(dto: CreateAppDto) {
    // create app namespace

    try {
      await this.k8sClient.createNamespace(dto.name)
    } catch (error) {
      console.error(error)
      return ResponseUtil.error('create app namespace error')
    }

    // create app resources
    const app = new Application()
    app.metadata.name = dto.name
    app.metadata.namespace = dto.name
    app.spec = new ApplicationSpec({
      appid: dto.name,
      state: dto.state,
      region: dto.region,
      bundleName: dto.bundleName,
      runtimeName: dto.runtimeName,
    })

    try {
      await this.k8sClient.objectApi.create(app.toJSON())
    } catch (error) {
      console.error(error)
      return ResponseUtil.error('create app resources error')
    }

    return ResponseUtil.ok('create app success')
  }

  findAll() {
    return `This action returns all apps`
  }

  findOne(id: number) {
    return `This action returns a #${id} app`
  }

  update(id: number, updateAppDto: UpdateAppDto) {
    return `This action updates a #${id} app`
  }

  remove(id: number) {
    return `This action removes a #${id} app`
  }
}
