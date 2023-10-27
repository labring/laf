import { Injectable, Logger } from '@nestjs/common'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { RegionService } from 'src/region/region.service'
import { CreateWebsiteDto } from './dto/create-website.dto'
import * as assert from 'node:assert'
import * as dns from 'node:dns'
import { SystemDatabase } from 'src/system-database'
import { WebsiteHosting, WebsiteHostingWithBucket } from './entities/website'
import { DomainPhase, DomainState } from 'src/gateway/entities/runtime-domain'
import { ObjectId } from 'mongodb'
import { BucketDomain } from 'src/gateway/entities/bucket-domain'

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name)
  private readonly db = SystemDatabase.db

  constructor(private readonly regionService: RegionService) {}

  async create(appid: string, dto: CreateWebsiteDto) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    // generate default website domain
    const domain = `${dto.bucketName}.${region.gatewayConf.websiteDomain}`

    const res = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .insertOne({
        appid: appid,
        bucketName: dto.bucketName,
        domain: domain,
        isCustom: false,
        state: DomainState.Active,
        phase: DomainPhase.Creating,
        lockedAt: TASK_LOCK_INIT_TIME,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    return await this.findOne(res.insertedId)
  }

  async count(appid: string) {
    const count = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .countDocuments({ appid })

    return count
  }

  async findAll(appid: string) {
    const websites = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .aggregate<WebsiteHostingWithBucket>()
      .match({ appid })
      .lookup({
        from: 'StorageBucket',
        localField: 'bucketName',
        foreignField: 'name',
        as: 'bucket',
      })
      .unwind('$bucket')
      .toArray()

    return websites
  }

  async findOne(id: ObjectId) {
    const website = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .aggregate<WebsiteHostingWithBucket>()
      .match({ _id: id })
      .lookup({
        from: 'StorageBucket',
        localField: 'bucketName',
        foreignField: 'name',
        as: 'bucket',
      })
      .unwind('$bucket')
      .next()

    return website
  }

  async checkResolved(website: WebsiteHosting, customDomain: string) {
    // get bucket domain
    const bucketDomain = await this.db
      .collection<BucketDomain>('BucketDomain')
      .findOne({
        appid: website.appid,
        bucketName: website.bucketName,
      })

    const cnameTarget = bucketDomain.domain

    // check domain is available
    const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 })
    const result = await resolver
      .resolveCname(customDomain as string)
      .catch(() => {
        return
      })

    if (!result) return false
    if (false === (result || []).includes(cnameTarget)) return false
    return true
  }

  async bindCustomDomain(id: ObjectId, domain: string) {
    const res = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .findOneAndUpdate(
        { _id: id },
        {
          $set: {
            domain: domain,
            isCustom: true,
            phase: DomainPhase.Deleting,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )

    return res.value
  }

  async removeOne(id: ObjectId) {
    const res = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .findOneAndUpdate(
        { _id: id },
        { $set: { state: DomainState.Deleted } },
        { returnDocument: 'after' },
      )

    return res.value
  }

  async removeAll(appid: string) {
    const res = await this.db
      .collection<WebsiteHosting>('WebsiteHosting')
      .updateMany(
        { appid },
        {
          $set: {
            state: DomainState.Deleted,
            phase: DomainPhase.Deleting,
            updatedAt: new Date(),
          },
        },
      )

    return res
  }
}
