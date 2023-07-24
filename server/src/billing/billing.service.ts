import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ResourceService } from './resource.service'
import { ObjectId } from 'mongodb'
import { ResourceType } from './entities/resource'
import { Decimal } from 'decimal.js'
import * as assert from 'assert'
import { ApplicationBilling } from './entities/application-billing'
import { CalculatePriceDto } from './dto/calculate-price.dto'
import { BillingQuery } from './interface/billing-query.interface'

@Injectable()
export class BillingService {
  private readonly db = SystemDatabase.db

  constructor(private readonly resource: ResourceService) {}

  async query(userId: ObjectId, condition?: BillingQuery) {
    const query = { createdBy: userId }

    if (condition.endTime) {
      query['endAt'] = { $lte: condition.endTime }
    }

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.appid) {
      query['appid'] = { $in: condition.appid }
    }

    if (condition.state) {
      query['state'] = condition.state
    }

    const { page, pageSize } = condition

    const total = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .countDocuments(query)

    const billings = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .sort({ startAt: -1 })
      .toArray()

    const res = {
      list: billings,
      total: total,
      page,
      pageSize,
    }

    return res
  }

  async findOne(appid: string, id: ObjectId) {
    const billing = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .findOne({ _id: id })

    return billing
  }

  async getExpenseByDay(userId: ObjectId, condition?: BillingQuery) {
    const query = { createdBy: userId }

    if (condition.endTime) {
      query['endAt'] = { $lte: condition.endTime }
    }

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.appid) {
      query['appid'] = { $in: condition.appid }
    }

    if (condition.state) {
      query['state'] = condition.state
    }
    const pipeline = [
      {
        $match: query,
      },
      {
        $project: {
          day: {
            $dateToString: { format: '%Y-%m-%d', date: '$endAt' },
          },
          amount: 1,
        },
      },
      {
        $group: {
          _id: '$day',
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          day: {
            $dateFromString: {
              dateString: '$_id',
              format: '%Y-%m-%d',
            },
          },
          totalAmount: 1,
        },
      },
      {
        $sort: { day: -1 },
      },
    ]
    const expense = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .aggregate(pipeline)
      .toArray()

    return expense
  }

  async getExpense(userId: ObjectId, condition?: BillingQuery) {
    const query = { createdBy: userId }

    if (condition.endTime) {
      query['endAt'] = { $lte: condition.endTime }
    }

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.appid) {
      query['appid'] = { $in: condition.appid }
    }

    if (condition.state) {
      query['state'] = condition.state
    }

    const totalExpense = await this.db
      .collection<ApplicationBilling>('ApplicationBilling')
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
          },
        },
      ])
      .toArray()

    return totalExpense.length > 0 ? totalExpense[0].totalAmount : 0
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
