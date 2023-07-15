import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ClientSession, ObjectId } from 'mongodb'
import { CloudFunction } from 'src/function/entities/cloud-function'
import { DataType, RecycleBin } from '../entities/recycle-bin'
import { CloudFunctionRecycleBinQuery } from './interface/function-recycle-bin-query.interface'
import { FunctionService } from 'src/function/function.service'

@Injectable()
export class FunctionRecycleBinService {
  private readonly logger = new Logger(FunctionRecycleBinService.name)
  private readonly db = SystemDatabase.db

  constructor(
    @Inject(forwardRef(() => FunctionService))
    private readonly functionService: FunctionService,
  ) {}

  async addToRecycleBin(func: CloudFunction, session?: ClientSession) {
    const res = await this.db
      .collection<RecycleBin>('RecycleBin')
      .insertOne(
        { type: DataType.FUNCTION, data: func, createdAt: new Date() },
        { session },
      )
    return res
  }

  async getRecycleBinStorage(appid: string) {
    const res = await this.db
      .collection<RecycleBin>('RecycleBin')
      .countDocuments({ type: DataType.FUNCTION, 'data.appid': appid })
    return res
  }

  async getRecycleBin(appid: string, condition: CloudFunctionRecycleBinQuery) {
    const query = {
      type: DataType.FUNCTION,
      'data.appid': appid,
    }
    if (condition.name) {
      query['data.name'] = {
        $regex: condition.name,
        $options: 'i',
      }
    }

    if (condition.startTime) {
      query['data.createdAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['data.createdAt']['$lte'] = condition.endTime
      } else {
        query['data.createdAt'] = { $lte: condition.endTime }
      }
    }

    const total = await this.db
      .collection<RecycleBin>('RecycleBin')
      .countDocuments(query)

    const functions = await this.db
      .collection<RecycleBin>('RecycleBin')
      .aggregate([
        { $match: query },
        {
          $replaceRoot: { newRoot: '$data' },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (condition.page - 1) * condition.pageSize },
        { $limit: condition.pageSize },
      ])
      .toArray()

    const res = {
      total,
      list: functions,
      page: condition.page,
      pageSize: condition.pageSize,
    }
    return res
  }

  async emptyRecycleBin(appid: string) {
    const res = await this.db
      .collection<RecycleBin>('RecycleBin')
      .deleteMany({ type: DataType.FUNCTION, 'data.appid': appid })
    return res
  }

  async deleteFromRecycleBin(appid: string, ids: ObjectId[]) {
    const res = await this.db.collection<RecycleBin>('RecycleBin').deleteMany({
      type: DataType.FUNCTION,
      'data._id': { $in: ids },
      'data.appid': appid,
    })
    return res
  }

  async restoreDeletedCloudFunctions(appid: string, ids: ObjectId[]) {
    const client = SystemDatabase.client
    const session = client.startSession()
    try {
      session.startTransaction()

      const recycleBinItems = await this.db
        .collection<RecycleBin>('RecycleBin')
        .find({
          type: DataType.FUNCTION,
          'data._id': { $in: ids },
          'data.appid': appid,
        })
        .toArray()

      const functions = recycleBinItems.map((item) => item.data)

      const insertResults = await this.db
        .collection<CloudFunction>('CloudFunction')
        .insertMany(functions, { session })

      await this.db.collection<RecycleBin>('RecycleBin').deleteMany(
        {
          type: DataType.FUNCTION,
          'data._id': { $in: ids },
          'data.appid': appid,
        },
        { session },
      )

      await this.functionService.publishMany(functions)

      await session.commitTransaction()

      return insertResults
    } catch (err) {
      await session.abortTransaction()
      this.logger.error(err)
      throw err
    } finally {
      await session.endSession()
    }
  }
}
