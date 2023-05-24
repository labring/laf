import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ResourceService } from './resource.service'
import { ObjectId } from 'mongodb'
import { ResourceType } from './entities/resource'
import { Decimal } from 'decimal.js'
import * as assert from 'assert'
import { CalculatePriceDto } from './dto/calculate-price.dto'
import { ApplicationBilling } from './entities/application-billing'

@Injectable()
export class BillingService {
  private readonly db = SystemDatabase.db

  constructor(private readonly resource: ResourceService) {}

  async findAllByAppId(appid: string) {
    const billings = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .find({ appid })
      .toArray()

    return billings
  }

  async findOne(appid: string, id: ObjectId) {
    const billing = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .findOne({ _id: id })

    return billing
  }

  async calculatePrice(dto: CalculatePriceDto) {
    // get options by region id
    const options = await this.resource.findAllByRegionId(
      new ObjectId(dto.regionId),
    )

    const groupedOptions = this.resource.groupByType(options)
    assert(groupedOptions[ResourceType.CPU], 'cpu option not found')
    assert(groupedOptions[ResourceType.Memory], 'memory option not found')
    assert(
      groupedOptions[ResourceType.StorageCapacity],
      'storage capacity option not found',
    )
    assert(
      groupedOptions[ResourceType.DatabaseCapacity],
      'database capacity option not found',
    )

    // calculate cpu price
    const cpuOption = groupedOptions[ResourceType.CPU]
    const cpuPrice = new Decimal(cpuOption.price).mul(dto.cpu)

    // calculate memory price
    const memoryOption = groupedOptions[ResourceType.Memory]
    const memoryPrice = new Decimal(memoryOption.price).mul(dto.memory)

    // calculate storage capacity price
    const storageOption = groupedOptions[ResourceType.StorageCapacity]
    const storagePrice = new Decimal(storageOption.price).mul(
      dto.storageCapacity,
    )

    // calculate database capacity price
    const databaseOption = groupedOptions[ResourceType.DatabaseCapacity]
    const databasePrice = new Decimal(databaseOption.price).mul(
      dto.databaseCapacity,
    )

    // calculate total price
    const totalPrice = cpuPrice
      .add(memoryPrice)
      .add(storagePrice)
      .add(databasePrice)

    return {
      cpu: cpuPrice.toNumber(),
      memory: memoryPrice.toNumber(),
      storageCapacity: storagePrice.toNumber(),
      databaseCapacity: databasePrice.toNumber(),
      total: totalPrice.toNumber(),
    }
  }
}
