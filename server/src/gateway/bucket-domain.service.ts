import { Injectable, Logger } from '@nestjs/common'
import { DomainPhase, DomainState, StorageBucket } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { RegionService } from '../region/region.service'
import * as assert from 'node:assert'
import { TASK_LOCK_INIT_TIME } from 'src/constants'

@Injectable()
export class BucketDomainService {
  private readonly logger = new Logger(BucketDomainService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
  ) {}

  /**
   *  Create app domain in database
   */
  async create(bucket: StorageBucket) {
    const region = await this.regionService.findByAppId(bucket.appid)
    assert(region, 'region not found')

    // create domain in db
    const bucket_domain = `${bucket.name}.${region.storageConf.domain}`
    const doc = await this.prisma.bucketDomain.create({
      data: {
        appid: bucket.appid,
        domain: bucket_domain,
        bucket: {
          connect: {
            name: bucket.name,
          },
        },
        state: DomainState.Active,
        phase: DomainPhase.Creating,
        lockedAt: TASK_LOCK_INIT_TIME,
      },
    })

    return doc
  }

  /**
   * Find an app domain in database
   */
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

  /**
   * Delete app domain in database:
   * - turn to `Deleted` state
   */
  async delete(bucket: StorageBucket) {
    const doc = await this.prisma.bucketDomain.update({
      where: {
        id: bucket.id,
        bucketName: bucket.name,
      },
      data: {
        state: DomainState.Deleted,
      },
    })

    return doc
  }
}
