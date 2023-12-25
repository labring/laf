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
import { PrometheusDriver } from 'prometheus-query'
import { Application } from 'src/application/entities/application'
import { RegionService } from 'src/region/region.service'

@Injectable()
export class BillingService {
  private readonly db = SystemDatabase.db

  constructor(
    private readonly resource: ResourceService,
    private readonly region: RegionService,
  ) {}

  async query(userId: ObjectId, condition?: BillingQuery) {
    const query = { createdBy: userId }

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['startAt']['$lte'] = condition.endTime
      } else {
        query['startAt'] = { $lte: condition.endTime }
      }
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

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['startAt']['$lte'] = condition.endTime
      } else {
        query['startAt'] = { $lte: condition.endTime }
      }
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
            $dateToString: { format: '%Y-%m-%d', date: '$startAt' },
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

    if (condition.startTime) {
      query['startAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['startAt']['$lte'] = condition.endTime
      } else {
        query['startAt'] = { $lte: condition.endTime }
      }
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

  async getMeteringData(app: Application, time: Date) {
    const region = await this.region.findOne(app.regionId)

    const prom = new PrometheusDriver({
      endpoint: region.prometheusConf.apiUrl,
    })

    const cpuTask = prom
      .instantQuery(`laf:billing:cpu{appid="${app.appid}"}`, time)
      .then((res) => res.result[0])
      .then((res) => Number(res.value.value))

    const memoryTask = prom
      .instantQuery(`laf:billing:memory{appid="${app.appid}"}`, time)
      .then((res) => res.result[0])
      .then((res) => Number(res.value.value))

    let error = false

    const [cpu, memory] = await Promise.all([cpuTask, memoryTask]).catch(() => {
      error = true
      return [0, 0]
    })
    if (error) {
      return null
    }

    return {
      cpu,
      memory,
    }
  }
}
