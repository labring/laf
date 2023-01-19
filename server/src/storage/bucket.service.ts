import { Injectable, Logger } from '@nestjs/common'
import { Application, StorageBucket } from '@prisma/client'
import { BucketDomainService } from 'src/gateway/bucket-domain.service'
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
    private readonly domainService: BucketDomainService,
  ) {}

  /**
   * @todo create gateway route for bucket
   */
  async create(app: Application, dto: CreateBucketDto) {
    const bucketName = dto.fullname(app.appid)

    // create bucket in minio
    const region = await this.regionService.findOne(app.regionName)
    const res = await this.minioService.createBucket(
      region,
      bucketName,
      dto.policy,
    )

    if (res.$metadata.httpStatusCode !== 200) {
      this.logger.error('create bucket in minio failed: ', res)
      return false
    }

    // create bucket in db
    try {
      const bucket = await this.prisma.storageBucket.create({
        data: {
          appid: app.appid,
          name: bucketName,
          policy: dto.policy,
          shortName: dto.shortName,
        },
      })

      // create domain for bucket
      await this.domainService.create(bucket)

      return bucket
    } catch (error) {
      this.logger.error('create bucket in db failed: ', error)
      this.logger.log('deleting bucket in minio: ', bucketName)

      // delete bucket in minio
      await this.minioService.deleteBucket(region, bucketName)

      return false
    }
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

  /**
   * @todo delete gateway route if exists
   */
  async delete(bucket: StorageBucket) {
    // delete bucket in minio
    const region = await this.regionService.findByAppId(bucket.appid)
    await this.minioService.deleteBucket(region, bucket.name)

    // delete bucket domain
    await this.domainService.delete(bucket)

    const res = await this.prisma.storageBucket.delete({
      where: {
        name: bucket.name,
      },
    })

    return res
  }
}
