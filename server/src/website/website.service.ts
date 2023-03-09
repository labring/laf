import { Injectable, Logger } from '@nestjs/common'
import { DomainPhase, DomainState, WebsiteHosting } from '@prisma/client'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'
import { RegionService } from 'src/region/region.service'
import { CreateWebsiteDto } from './dto/create-website.dto'
import * as assert from 'node:assert'
import * as dns from 'node:dns'

@Injectable()
export class WebsiteService {
  private readonly logger = new Logger(WebsiteService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
  ) {}

  async create(appid: string, dto: CreateWebsiteDto) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    // generate default website domain
    const domain = `${dto.bucketName}.${region.gatewayConf.websiteDomain}`

    const website = await this.prisma.websiteHosting.create({
      data: {
        appid: appid,
        domain: domain,
        isCustom: false,
        state: DomainState.Active,
        phase: DomainPhase.Creating,
        lockedAt: TASK_LOCK_INIT_TIME,
        bucket: {
          connect: {
            name: dto.bucketName,
          },
        },
      },
    })

    return website
  }

  async count(appid: string) {
    const count = await this.prisma.websiteHosting.count({
      where: {
        appid: appid,
      },
    })

    return count
  }

  async findAll(appid: string) {
    const websites = await this.prisma.websiteHosting.findMany({
      where: {
        appid: appid,
      },
      include: {
        bucket: true,
      },
    })

    return websites
  }

  async findOne(id: string) {
    const website = await this.prisma.websiteHosting.findFirst({
      where: {
        id,
      },
      include: {
        bucket: true,
      },
    })

    return website
  }

  async checkResolved(website: WebsiteHosting, customDomain: string) {
    // get bucket domain
    const bucketDomain = await this.prisma.bucketDomain.findFirst({
      where: {
        appid: website.appid,
        bucketName: website.bucketName,
      },
    })

    const cnameTarget = bucketDomain.domain

    // check domain is available
    const resolver = new dns.promises.Resolver({ timeout: 3000, tries: 1 })
    const result = await resolver
      .resolveCname(customDomain as string)
      .catch(() => {
        return
      })

    if (!result) {
      return false
    }

    if (false === (result || []).includes(cnameTarget)) {
      return false
    }

    return true
  }

  async bindCustomDomain(id: string, domain: string) {
    const website = await this.prisma.websiteHosting.update({
      where: {
        id,
      },
      data: {
        domain: domain,
        isCustom: true,
        phase: DomainPhase.Deleting,
      },
    })

    return website
  }

  async remove(id: string) {
    const website = await this.prisma.websiteHosting.update({
      where: {
        id,
      },
      data: {
        state: DomainState.Deleted,
      },
    })

    return website
  }

  async removeAll(appid: string) {
    const websites = await this.prisma.websiteHosting.updateMany({
      where: {
        appid,
      },
      data: {
        state: DomainState.Deleted,
      },
    })

    return websites
  }
}
