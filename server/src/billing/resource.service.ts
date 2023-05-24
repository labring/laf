import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ObjectId } from 'mongodb'
import {
  ResourceOption,
  ResourceBundle,
  ResourceType,
} from './entities/resource'

@Injectable()
export class ResourceService {
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

  async findOneByType(type: ResourceType) {
    const option = await this.db
      .collection<ResourceOption>('ResourceOption')
      .findOne({ type: type })
    return option
  }

  async findAllByRegionId(regionId: ObjectId) {
    const options = await this.db
      .collection<ResourceOption>('ResourceOption')
      .find({ regionId })
      .toArray()

    return options
  }

  async findAllBundles() {
    const options = await this.db
      .collection<ResourceBundle>('ResourceBundle')
      .find()
      .toArray()

    return options
  }

  groupByType(options: ResourceOption[]) {
    type GroupedOptions = {
      [key in ResourceType]: ResourceOption
    }

    const groupedOptions = options.reduce((acc, cur) => {
      acc[cur.type] = cur
      return acc
    }, {} as GroupedOptions)

    return groupedOptions
  }
}
