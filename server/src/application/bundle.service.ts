import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { Cache } from 'cache-manager'
import { ApplicationBundle } from 'src/application/entities/application-bundle'
import { SystemDatabase } from 'src/system-database'

@Injectable()
export class BundleService {
  private readonly logger = new Logger(BundleService.name)
  private readonly db = SystemDatabase.db
  private readonly CACHE_PREFIX = `laf:application:bundle`

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findOne(appid: string) {
    let bundle = await this.cacheManager.get<ApplicationBundle>(
      `${this.CACHE_PREFIX}:${appid}`,
    )
    if (!bundle) {
      bundle = await this.db
        .collection<ApplicationBundle>('ApplicationBundle')
        .findOne({ appid })
      await this.cacheManager.set(`${this.CACHE_PREFIX}:${appid}`, bundle)
    }

    return bundle
  }

  async deleteOne(appid: string) {
    const res = await this.db
      .collection<ApplicationBundle>('ApplicationBundle')
      .findOneAndDelete({ appid })

    if (res.ok) await this.cacheManager.del(`${this.CACHE_PREFIX}:${appid}`)

    return res.value
  }
}
