import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ObjectId } from 'mongodb'
import {
  ResourceOption,
  ResourceBundle,
  ResourceType,
} from './entities/resource'
import { CalculatePriceDto } from './dto/calculate-price.dto'

@Injectable()
export class ResourceService {
  private readonly db = SystemDatabase.db

  async findAll() {
    const options = await this.db
      .collection<ResourceOption>('ResourceOption')
      .find({})
      .sort({ createdAt: 1 })
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
      .sort({ createdAt: 1 })
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

  async findAllBundles() {
    const options = await this.db
      .collection<ResourceBundle>('ResourceBundle')
      .find()
      .sort({ createdAt: 1 })
      .toArray()

    return options
  }

  async findAllBundlesByRegionId(regionId: ObjectId) {
    const options = await this.db
      .collection<ResourceBundle>('ResourceBundle')
      .find({ regionId })
      .sort({ createdAt: 1 })
      .toArray()

    return options
  }

  async findTrialBundle(regionId: ObjectId) {
    const bundle = await this.db
      .collection<ResourceBundle>('ResourceBundle')
      .findOne({ enableFreeTier: true, regionId })

    return bundle
  }

  // check if input bundle is trial bundle
  async isTrialBundle(input: CalculatePriceDto) {
    const regionId = new ObjectId(input.regionId)
    const bundle = await this.findTrialBundle(regionId)

    if (!bundle) {
      return false
    }

    const cpu = bundle.spec.cpu.value
    const memory = bundle.spec.memory.value
    const storage = bundle.spec.storageCapacity.value
    const database = bundle.spec.databaseCapacity.value

    if (
      cpu === input.cpu &&
      memory === input.memory &&
      storage === input.storageCapacity &&
      database === input.databaseCapacity
    ) {
      return true
    }

    return false
  }
}
