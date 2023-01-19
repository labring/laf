import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as assert from 'assert'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'

@Injectable()
export class FunctionDomainService {
  private readonly logger = new Logger(FunctionDomainService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
  ) {}

  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    const app_domain = `${appid}.${region.gatewayConf.domain}`

    // create route first
    const route = await this.apisixService.createAppRoute(
      region,
      appid,
      app_domain,
    )

    this.logger.debug('route created:', route)

    // create domain in db
    const doc = await this.prisma.applicationDomain.create({
      data: {
        appid: appid,
        domain: app_domain,
        state: 'Active',
      },
    })

    return doc
  }

  async findOne(appid: string) {
    const doc = await this.prisma.applicationDomain.findFirst({
      where: {
        appid: appid,
      },
    })

    return doc
  }

  async delete(appid: string) {
    // delete route first
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    const res = await this.apisixService.deleteAppRoute(region, appid)
    this.logger.debug('route deleted:', res)

    // delete domain in db
    const doc = await this.prisma.applicationDomain.delete({
      where: {
        appid: appid,
      },
    })

    return doc
  }
}
