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
import {
  Application,
  ApplicationState,
} from 'src/application/entities/application'
import { RegionService } from 'src/region/region.service'
import { Traffic } from './entities/network-traffic'
import { TrafficDatabase } from 'src/system-database'

@Injectable()
export class BillingService {
  private readonly db = SystemDatabase.db
  private readonly trafficDB = TrafficDatabase.db

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
    assert(
      groupedOptions[ResourceType.DedicatedDatabaseCPU],
      'dedicated database cpu option not found',
    )
    assert(
      groupedOptions[ResourceType.DedicatedDatabaseMemory],
      'dedicated database memory option not found',
    )
    assert(
      groupedOptions[ResourceType.DedicatedDatabaseCapacity],
      'dedicated database capacity option not found',
    )
    assert(
      groupedOptions[ResourceType.DedicatedDatabaseReplicas],
      'dedicated database replicas option not found',
    )

    assert(
      groupedOptions[ResourceType.NetworkTraffic],
      'network traffic not found',
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
      dto.databaseCapacity || 0,
    )

    const ddbCPUOption = groupedOptions[ResourceType.DedicatedDatabaseCPU]
    const ddbCPUPrice = dto.dedicatedDatabase
      ? new Decimal(ddbCPUOption.price)
          .mul(dto.dedicatedDatabase.cpu)
          .mul(dto.dedicatedDatabase.replicas)
      : new Decimal(0)

    const ddbMemoryOption = groupedOptions[ResourceType.DedicatedDatabaseMemory]
    const ddbMemoryPrice = dto.dedicatedDatabase
      ? new Decimal(ddbMemoryOption.price)
          .mul(dto.dedicatedDatabase.memory)
          .mul(dto.dedicatedDatabase.replicas)
      : new Decimal(0)

    const ddbCapacityOption =
      groupedOptions[ResourceType.DedicatedDatabaseCapacity]
    const ddbCapacityPrice = dto.dedicatedDatabase
      ? new Decimal(ddbCapacityOption.price)
          .mul(dto.dedicatedDatabase.capacity)
          .mul(dto.dedicatedDatabase.replicas)
      : new Decimal(0)

    const ddbTotalPrice = ddbCPUPrice.add(ddbMemoryPrice).add(ddbCapacityPrice)

    const networkTrafficOption = groupedOptions[ResourceType.NetworkTraffic]
    const networkTrafficPrice = new Decimal(networkTrafficOption.price).mul(
      dto.networkTraffic || 0,
    )

    // calculate total price
    const totalPrice = cpuPrice
      .add(memoryPrice)
      .add(storagePrice)
      .add(databasePrice)
      .add(ddbTotalPrice)
      .add(networkTrafficPrice)

    return {
      cpu: cpuPrice.toNumber(),
      memory: memoryPrice.toNumber(),
      storageCapacity: storagePrice.toNumber(),
      databaseCapacity: databasePrice.toNumber(),
      dedicatedDatabase: {
        cpu: ddbCPUPrice.toNumber(),
        memory: ddbMemoryPrice.toNumber(),
        capacity: ddbCapacityPrice.toNumber(),
      },
      networkTraffic: networkTrafficPrice.toNumber(),
      total: totalPrice.toNumber(),
    }
  }

  async getMeteringData(app: Application, startAt: Date, endAt: Date) {
    const region = await this.region.findOne(app.regionId)

    const prom = new PrometheusDriver({
      endpoint: region.prometheusConf.apiUrl,
    })

    const cpuTask = prom
      .instantQuery(`laf:billing:cpu{appid="${app.appid}"}`, endAt)
      .then((res) => res.result[0])
      .then((res) => Number(res.value.value))

    const memoryTask = prom
      .instantQuery(`laf:billing:memory{appid="${app.appid}"}`, endAt)
      .then((res) => res.result[0])
      .then((res) => Number(res.value.value))

    const [cpu, memory] = await Promise.all([cpuTask, memoryTask]).catch(() => {
      return [0, 0]
    })

    const networkTraffic = await this.getAppTrafficUsage(app, startAt, endAt)

    return {
      cpu,
      memory,
      networkTraffic,
    }
  }

  async getAppTrafficUsage(
    app: Application,
    startAt: Date,
    endAt: Date,
  ): Promise<number> {
    if (!this.trafficDB) {
      return 0
    }

    // If the application stops during the current hour, traffic for the current hour is still billed
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    if (app.state === ApplicationState.Stopped && app.updatedAt < twoHoursAgo) {
      return 0
    }

    const aggregationPipeline = [
      {
        $match: {
          'traffic_meta.pod_type_name': app.appid,
          timestamp: { $gte: startAt, $lt: endAt },
        },
      },
      {
        $group: {
          _id: null,
          totalSentBytes: { $sum: '$sent_bytes' },
        },
      },
    ]

    // get app network usage
    const result = await this.trafficDB
      .collection<Traffic>('traffic')
      .aggregate(aggregationPipeline)
      .toArray()

    // [ { _id: null, totalSentBytes: Long('70204946') } ]
    const totalSentBytes = result[0]?.totalSentBytes || 0
    const bytesPerMegabyte = 1024 * 1024
    const totalSentMegabytes = Math.ceil(totalSentBytes / bytesPerMegabyte)

    return totalSentMegabytes
  }
}
