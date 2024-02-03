import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { Region } from './entities/region'
import { Application } from 'src/application/entities/application'
import { assert } from 'console'
import { ObjectId } from 'mongodb'

@Injectable()
export class RegionService {
  private readonly db = SystemDatabase.db

  async findByAppId(appid: string) {
    const app = await this.db
      .collection<Application>('Application')
      .findOne({ appid })

    assert(app, `Application ${appid} not found`)
    const doc = await this.db
      .collection<Region>('Region')
      .findOne({ _id: app.regionId })

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
    const projection = {
      _id: 1,
      name: 1,
      displayName: 1,
      state: 1,
      dedicatedDatabase: '$databaseConf.dedicatedDatabase.enabled',
    }

    const region = await this.db
      .collection<Region>('Region')
      .findOne({ _id: new ObjectId(id) }, { projection })

    return region
  }

  async findAllDesensitized() {
    const projection = {
      _id: 1,
      name: 1,
      displayName: 1,
      state: 1,
      bundles: 1,
      dedicatedDatabase: '$databaseConf.dedicatedDatabase.enabled',
    }

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

    return regions
  }
}
