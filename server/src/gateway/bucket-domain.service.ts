import { Injectable, Logger } from '@nestjs/common'
import { StorageBucket } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'
import * as assert from 'node:assert'

@Injectable()
export class BucketDomainService {
  private readonly logger = new Logger(BucketDomainService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
  ) {}

  async create(bucket: StorageBucket) {
    const region = await this.regionService.findByAppId(bucket.appid)
    assert(region, 'region not found')

    const bucket_domain = `${bucket.name}.${region.storageConf.domain}`

    // create route first
    const route = await this.apisixService.createBucketRoute(
      region,
      bucket.name,
      bucket_domain,
    )

    this.logger.debug('route created:', route)

    // create domain in db
    const doc = await this.prisma.bucketDomain.create({
      data: {
        appid: bucket.appid,
        domain: bucket_domain,
        bucket: {
          connect: {
            name: bucket.name,
          },
        },
        state: 'Active',
      },
    })

    return doc
  }

  async findOne(bucket: StorageBucket) {
    const doc = await this.prisma.bucketDomain.findFirst({
      where: {
        bucket: {
          name: bucket.name,
        },
      },
    })

    return doc
  }

  async delete(bucket: StorageBucket) {
    // delete route first
    const region = await this.regionService.findByAppId(bucket.appid)
    assert(region, 'region not found')

    const res = await this.apisixService.deleteBucketRoute(region, bucket.name)
    this.logger.debug('route deleted:', res)

    // delete domain in db
    const doc = await this.prisma.bucketDomain.delete({
      where: {
        bucketName: bucket.name,
      },
    })

    return doc
  }
}
