import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as assert from 'assert'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'
import { DomainPhase, DomainState } from '@prisma/client'

@Injectable()
export class FunctionDomainService {
  private readonly logger = new Logger(FunctionDomainService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly regionService: RegionService,
    private readonly apisixService: ApisixService,
  ) {}

  /**
   * Create app domain in database
   */
  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    // create domain in db
    const app_domain = `${appid}.${region.gatewayConf.functionDomain}`
    const doc = await this.prisma.applicationDomain.create({
      data: {
        appid: appid,
        domain: app_domain,
        state: DomainState.Active,
        phase: DomainPhase.Creating,
        lockedAt: null,
      },
    })

    return doc
  }

  /**
   * Find an app domain in database
   */
  async findOne(appid: string) {
    const doc = await this.prisma.applicationDomain.findFirst({
      where: {
        appid: appid,
      },
    })

    return doc
  }

  /**
   * Delete app domain in database:
   * - turn to `Deleted` state
   */
  async delete(appid: string) {
    const doc = await this.prisma.applicationDomain.update({
      where: {
        appid: appid,
      },
      data: {
        state: DomainState.Deleted,
      },
    })

    return doc
  }
}
