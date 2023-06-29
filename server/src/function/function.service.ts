import { Injectable, Logger } from '@nestjs/common'
import { compileTs2js } from '../utils/lang'
import {
  APPLICATION_SECRET_KEY,
  CN_FUNCTION_LOGS,
  CN_PUBLISHED_FUNCTIONS,
} from '../constants'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import * as assert from 'node:assert'
import { JwtService } from '@nestjs/jwt'
import { CompileFunctionDto } from './dto/compile-function.dto'
import { DatabaseService } from 'src/database/database.service'
import { GetApplicationNamespaceByAppId } from 'src/utils/getter'
import { SystemDatabase } from 'src/system-database'
import { ObjectId } from 'mongodb'
import { CloudFunction } from './entities/cloud-function'
import { ApplicationConfiguration } from 'src/application/entities/application-configuration'
import { FunctionLog } from 'src/log/entities/function-log'
import { CloudFunctionHistory } from './entities/cloud-function-history'

@Injectable()
export class FunctionService {
  private readonly logger = new Logger(FunctionService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}
  async create(appid: string, userid: ObjectId, dto: CreateFunctionDto) {
    await this.db.collection<CloudFunction>('CloudFunction').insertOne({
      appid,
      name: dto.name,
      source: {
        code: dto.code,
        compiled: compileTs2js(dto.code),
        version: 0,
      },
      desc: dto.description,
      createdBy: userid,
      methods: dto.methods,
      tags: dto.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const fn = await this.findOne(appid, dto.name)

    await this.addOneHistoryRecord(fn)
    await this.publish(fn)
    return fn
  }

  async findAll(appid: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .find({ appid })
      .toArray()

    return res
  }

  async count(appid: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .countDocuments({ appid })

    return res
  }

  async findOne(appid: string, name: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .findOne({ appid, name })

    return res
  }

  async updateOne(func: CloudFunction, dto: UpdateFunctionDto) {
    if (dto.name) {
      const existingNames = new Set(
        await this.db
          .collection<CloudFunction>('CloudFunction')
          .aggregate([
            { $match: { appid: func.appid } },
            { $group: { _id: null, names: { $addToSet: '$name' } } },
          ])
          .toArray()
          .then((result) => (result.length > 0 ? result[0].names : [])),
      )

      if (existingNames.has(dto.name)) {
        return new Error('Function name already exists')
      }

      const fn = await this.db
        .collection<CloudFunction>('CloudFunction')
        .findOneAndUpdate(
          { appid: func.appid, name: func.name },
          {
            $set: {
              name: dto.name,
              desc: dto.description,
              methods: dto.methods,
              tags: dto.tags || [],
              updatedAt: new Date(),
            },
          },
          { returnDocument: 'after' },
        )

      await this.publish(fn.value, func.name)
      return fn.value
    }

    await this.db.collection<CloudFunction>('CloudFunction').updateOne(
      { appid: func.appid, name: func.name },
      {
        $set: {
          source: {
            code: dto.code,
            compiled: compileTs2js(dto.code),
            version: func.source.version + 1,
          },
          desc: dto.description,
          methods: dto.methods,
          tags: dto.tags || [],
          params: dto.params,
          updatedAt: new Date(),
        },
      },
    )

    const fn = await this.findOne(func.appid, func.name)
    await this.addOneHistoryRecord(fn)
    await this.publish(fn)
    return fn
  }

  async removeOne(func: CloudFunction) {
    const { appid, name } = func
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .findOneAndDelete({ appid, name })

    await this.deleteHistory(res.value)
    await this.unpublish(appid, name)
    return res.value
  }

  async removeAll(appid: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .deleteMany({ appid })

    await this.deleteHistoryAll(appid)

    return res
  }

  async publish(func: CloudFunction, oldFuncName?: string) {
    const { db, client } = await this.databaseService.findAndConnect(func.appid)
    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
        await coll.deleteOne(
          { name: oldFuncName ? oldFuncName : func.name },
          { session },
        )
        await coll.insertOne(func, { session })
      })
    } finally {
      await session.endSession()
      await client.close()
    }
  }

  async unpublish(appid: string, name: string) {
    const { db, client } = await this.databaseService.findAndConnect(appid)
    try {
      const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
      await coll.deleteOne({ name })
    } finally {
      await client.close()
    }
  }

  async compile(func: CloudFunction, dto: CompileFunctionDto) {
    const data: CloudFunction = {
      ...func,
      source: {
        ...func.source,
        code: dto.code,
        compiled: compileTs2js(dto.code),
        version: func.source.version + 1,
      },
      updatedAt: new Date(),
    }
    return data
  }

  async generateRuntimeToken(
    appid: string,
    type: 'trigger' | 'develop',
    expireSeconds = 60,
  ) {
    assert(appid, 'appid is required')
    assert(type, 'type is required')

    const conf = await this.db
      .collection<ApplicationConfiguration>('ApplicationConfiguration')
      .findOne({ appid })

    assert(conf, 'ApplicationConfiguration not found')

    // get secret from envs
    const secret = conf?.environments?.find(
      (env) => env.name === APPLICATION_SECRET_KEY,
    )
    assert(secret?.value, 'application secret not found')

    // generate token
    const exp = Math.floor(Date.now() / 1000) + expireSeconds

    const token = this.jwtService.sign(
      { appid, type, exp },
      { secret: secret.value },
    )
    return token
  }

  /**
   * Get the in-cluster url of runtime
   * @param appid
   * @returns
   */
  getInClusterRuntimeUrl(appid: string) {
    const serviceName = appid
    const namespace = GetApplicationNamespaceByAppId(appid)
    const appAddress = `${serviceName}.${namespace}:8000`
    const url = `http://${appAddress}`
    return url
  }

  async getLogs(
    appid: string,
    params: {
      page: number
      pageSize: number
      requestId?: string
      functionName?: string
    },
  ) {
    const { page, pageSize, requestId, functionName } = params
    const { db, client } = await this.databaseService.findAndConnect(appid)

    try {
      const coll = db.collection<FunctionLog>(CN_FUNCTION_LOGS)
      const query: any = {}
      if (requestId) {
        query.request_id = requestId
      }
      if (functionName) {
        query.func = functionName
      }

      const data = await coll
        .find(query, {
          limit: pageSize,
          skip: (page - 1) * pageSize,
          sort: { _id: -1 },
        })
        .toArray()

      const total = await coll.countDocuments(query)
      return { data, total }
    } finally {
      await client.close()
    }
  }

  async getHistory(func: CloudFunction) {
    const history = await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .find(
        {
          functionId: func._id,
        },
        {
          limit: 30,
          sort: {
            createdAt: -1,
          },
        },
      )
      .toArray()

    return history
  }

  async addOneHistoryRecord(func: CloudFunction) {
    await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .insertOne({
        appid: func.appid,
        functionId: func._id,
        source: {
          code: func.source.code,
        },
        createdAt: new Date(),
      })
  }

  async deleteHistory(func: CloudFunction) {
    const res = await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .deleteMany({
        functionId: func._id,
      })
    return res
  }

  async deleteHistoryAll(appid: string) {
    const res = await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .deleteMany({
        appid,
      })
    return res
  }
}
