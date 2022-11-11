import { Injectable } from '@nestjs/common'
import { KubernetesService } from '../core/kubernetes.service'
import { CreateAppDto } from './dto/create-app.dto'
import { UpdateAppDto } from './dto/update-app.dto'
import { Application, ApplicationSpec } from './entities/app.entity'

@Injectable()
export class AppsService {
  constructor(private k8sClient: KubernetesService) {}

  async create(dto: CreateAppDto) {
    // create app namespace
    await this.k8sClient.createNamespace(dto.name)

    // create app resources
    const app = new Application(dto.name)
    app.spec = new ApplicationSpec({
      appid: dto.name,
      state: dto.state,
      region: dto.region,
      bundleName: dto.bundleName,
      runtimeName: dto.runtimeName,
    })
    app.metadata.namespace = dto.name

    console.log(app.toJSON())
    const res = await this.k8sClient.objectApi.create(app.toJSON())

    return res.body
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
