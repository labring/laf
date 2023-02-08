import { Injectable, Logger } from '@nestjs/common'
import {
  Application,
  StorageBucket,
  StoragePhase,
  StorageState,
} from '@prisma/client'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { PrismaService } from '../prisma.service'
import { RegionService } from '../region/region.service'
import { CreateBucketDto } from './dto/create-bucket.dto'
import { UpdateBucketDto } from './dto/update-bucket.dto'
import { MinioService } from './minio/minio.service'

@Injectable()
export class BucketService {
  private readonly logger = new Logger(BucketService.name)

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
    private readonly prisma: PrismaService,
  ) {}

  async create(app: Application, dto: CreateBucketDto) {
    const bucketName = dto.fullname(app.appid)

    // create bucket in db
    const bucket = await this.prisma.storageBucket.create({
      data: {
        appid: app.appid,
        name: bucketName,
        policy: dto.policy,
        shortName: dto.shortName,
        state: StorageState.Active,
        phase: StoragePhase.Creating,
        lockedAt: TASK_LOCK_INIT_TIME,
      },
    })

    return bucket
  }

  async findOne(appid: string, name: string) {
    const bucket = await this.prisma.storageBucket.findFirst({
      where: {
        appid,
        name,
      },
      include: {
        domain: true,
      },
    })

    return bucket
  }

  async findAll(appid: string) {
    const buckets = await this.prisma.storageBucket.findMany({
      where: {
        appid,
      },
      include: {
        domain: true,
      },
    })

    return buckets
  }

  async update(bucket: StorageBucket, dto: UpdateBucketDto) {
    // update bucket in minio
    const region = await this.regionService.findByAppId(bucket.appid)
    const out = await this.minioService.updateBucketPolicy(
      region,
      bucket.name,
      dto.policy,
    )
    if (out.$metadata.httpStatusCode !== 204) {
      this.logger.error('update bucket in minio failed: ', out)
      return false
    }

    // update bucket in db
    const res = await this.prisma.storageBucket.update({
      where: {
        name: bucket.name,
      },
      data: {
        policy: dto.policy,
      },
    })

    return res
  }

  async delete(bucket: StorageBucket) {
    const res = await this.prisma.storageBucket.update({
      where: {
        name: bucket.name,
      },
      data: {
        state: StorageState.Deleted,
      },
    })

    return res
  }
}
