import { Injectable, Logger } from '@nestjs/common'
import { KubernetesService } from 'src/core/kubernetes.service'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { UpdateBucketDto } from './dto/update-bucket.dto'
import { Bucket, IBucket } from './entities/bucket.entity'

@Injectable()
export class BucketsService {
  logger: Logger = new Logger(BucketsService.name)
  constructor(private readonly k8sClient: KubernetesService) {}

  async create(dto: CreateBucketDto) {
    const namespace = dto.appid
    const bucket = Bucket.create(dto.name, namespace)
    bucket.spec = {
      policy: dto.policy,
      storage: dto.storage,
    }

    try {
      const res = await this.k8sClient.objectApi.create(bucket)
      return res.body
    } catch (error) {
      this.logger.error(error)
      return null
    }
  }

  findAll() {
    return `This action returns all buckets`
  }

  async findOne(appid: string, name: string): Promise<IBucket> {
    return null
  }

  update(id: number, updateBucketDto: UpdateBucketDto) {
    return `This action updates a #${id} bucket`
  }

  remove(id: number) {
    return `This action removes a #${id} bucket`
  }
}
