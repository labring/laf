import { Inject, Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { Region } from './entities/region'
import { Application } from 'src/application/entities/application'
import { assert } from 'console'
import { ObjectId } from 'mongodb'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class RegionService {
  private readonly db = SystemDatabase.db
  private readonly CACHE_PREFIX = 'laf:region'

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async findByAppId(appid: string) {
    const region = await this.cacheManager.get<Region>(
      `${this.CACHE_PREFIX}:findByAppId:${appid}`,
    )
    if (region) return region

    const app = await this.db
      .collection<Application>('Application')
      .findOne({ appid })

    assert(app, `Application ${appid} not found`)
    const doc = await this.db
      .collection<Region>('Region')
      .findOne({ _id: app.regionId })
    await this.cacheManager.set(
      `${this.CACHE_PREFIX}:findByAppId:${appid}`,
      doc,
    )

    return doc
  }

  async findOne(id: ObjectId) {
    const doc = await this.db.collection<Region>('Region').findOne({ _id: id })
    return doc
  }

  async findAll() {
    const regions = await this.db.collection<Region>('Region').find().toArray()
    return regions
  }

  async findOneDesensitized(id: ObjectId) {
    const _region = await this.cacheManager.get<Region>(
      `${this.CACHE_PREFIX}:findOneDesensitized:${id.toString()}`,
    )
    if (_region) return _region

    const projection = {
      _id: 1,
      name: 1,
      displayName: 1,
      state: 1,
    }

    const region = await this.db
      .collection<Region>('Region')
      .findOne({ _id: new ObjectId(id) }, { projection })
    await this.cacheManager.set(
      `${this.CACHE_PREFIX}:findOneDesensitized:${id.toString()}`,
      region,
    )

    return region
  }

  async findAllDesensitized() {
    const projection = {
      _id: 1,
      name: 1,
      displayName: 1,
      state: 1,
      bundles: 1,
    }

    const _regions = await this.cacheManager.get<Document[]>(
      `${this.CACHE_PREFIX}:findAllDesensitized`,
    )
    if (_regions) return _regions

    const regions = await this.db
      .collection<Region>('Region')
      .aggregate()
      .match({})
      .lookup({
        from: 'ResourceBundle',
        localField: '_id',
        foreignField: 'regionId',
        as: 'bundles',
      })
      .project(projection)
      .toArray()

    await this.cacheManager.set(
      `${this.CACHE_PREFIX}:findAllDesensitized`,
      regions,
    )

    return regions
  }
}
