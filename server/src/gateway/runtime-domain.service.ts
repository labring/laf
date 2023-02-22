import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import * as assert from 'assert'
import { RegionService } from '../region/region.service'
import { ApisixService } from './apisix.service'
import { DomainPhase, DomainState } from '@prisma/client'
import { TASK_LOCK_INIT_TIME } from 'src/constants'

@Injectable()
export class RuntimeDomainService {
  private readonly logger = new Logger(RuntimeDomainService.name)

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
    const app_domain = `${appid}.${region.gatewayConf.runtimeDomain}`
    const doc = await this.prisma.runtimeDomain.create({
      data: {
        appid: appid,
        domain: app_domain,
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
  async findOne(appid: string) {
    const doc = await this.prisma.runtimeDomain.findFirst({
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
    const doc = await this.prisma.runtimeDomain.update({
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
