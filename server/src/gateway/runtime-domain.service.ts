import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'assert'
import { RegionService } from '../region/region.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  DomainPhase,
  DomainState,
  RuntimeDomain,
} from './entities/runtime-domain'
import * as dns from 'node:dns'

@Injectable()
export class RuntimeDomainService {
  private readonly logger = new Logger(RuntimeDomainService.name)
  private readonly db = SystemDatabase.db

  constructor(private readonly regionService: RegionService) {}

  /**
   * Create app domain in database
   */
  async create(appid: string) {
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    // create domain in db
    const app_domain = `${appid}.${region.gatewayConf.runtimeDomain}`
    await this.db.collection<RuntimeDomain>('RuntimeDomain').insertOne({
      appid: appid,
      domain: app_domain,
      state: DomainState.Active,
      phase: DomainPhase.Creating,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.findOne(appid)
  }

  async checkResolved(appid: string, customDomain: string) {
    const runtimeDomain = await this.db
      .collection<RuntimeDomain>('RuntimeDomain')
      .findOne({ appid })

    const cnameTarget = runtimeDomain.domain

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

  async bindCustomDomain(appid: string, customDomain: string) {
    const res = await this.db
      .collection<RuntimeDomain>('RuntimeDomain')
      .findOneAndUpdate(
        { appid },
        {
          $set: {
            customDomain,
            phase: DomainPhase.Deleting,
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: 'after',
        },
      )

    return res.value
  }

  async removeCustomDomain(appid: string) {
    const res = await this.db
      .collection<RuntimeDomain>('RuntimeDomain')
      .findOneAndUpdate(
        { appid },
        {
          $set: {
            customDomain: null,
            phase: DomainPhase.Deleting,
            updatedAt: new Date(),
          },
        },
        {
          returnDocument: 'after',
        },
      )

    return res.value
  }

  /**
   * Find an app domain in database
   */
  async findOne(appid: string) {
    const doc = await this.db
      .collection<RuntimeDomain>('RuntimeDomain')
      .findOne({ appid })

    return doc
  }

  /**
   * Delete app domain in database:
   * - turn to `Deleted` state
   */
  async deleteOne(appid: string) {
    const doc = await this.db
      .collection<RuntimeDomain>('RuntimeDomain')
      .findOneAndUpdate(
        { appid: appid },
        {
          $set: {
            state: DomainState.Deleted,
            phase: DomainPhase.Deleting,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )

    return doc
  }
}
