import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/database/system-database'
import { ObjectId } from 'mongodb'
import { ResourceOption, ResourceTemplate } from './entities/resource'

@Injectable()
export class ResourceOptionService {
  private readonly db = SystemDatabase.db

  async findAll() {
    const options = await this.db
      .collection<ResourceOption>('ResourceOption')
      .find()
      .toArray()
    return options
  }

  async findOne(id: ObjectId) {
    const option = await this.db
      .collection<ResourceOption>('ResourceOption')
      .findOne({ _id: id })
    return option
  }

  async findAllByRegionId(regionId: ObjectId) {
    const options = await this.db
      .collection<ResourceOption>('ResourceOption')
      .find({ regionId })
      .toArray()

    return options
  }

  async findAllTemplates() {
    const options = await this.db
      .collection<ResourceTemplate>('ResourceTemplate')
      .find()
      .toArray()

    return options
  }
}
