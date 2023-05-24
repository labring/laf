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
    await this.publish(fn)
    return fn
  }

  async removeOne(func: CloudFunction) {
    const { appid, name } = func
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .findOneAndDelete({ appid, name })

    await this.unpublish(appid, name)
    return res.value
  }

  async removeAll(appid: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .deleteMany({ appid })

    return res
  }

  async publish(func: CloudFunction) {
    const { db, client } = await this.databaseService.findAndConnect(func.appid)
    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
        await coll.deleteOne({ name: func.name }, { session })
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
      limit: number
      requestId?: string
      functionName?: string
    },
  ) {
    const { page, limit, requestId, functionName } = params
    const { db, client } = await this.databaseService.findAndConnect(appid)

    try {
      const coll = db.collection(CN_FUNCTION_LOGS)
      const query: any = {}
      if (requestId) {
        query.request_id = requestId
      }
      if (functionName) {
        query.func = functionName
      }

      const data = await coll
        .find(query, {
          limit,
          skip: (page - 1) * limit,
          sort: { _id: -1 },
        })
        .toArray()

      const total = await coll.countDocuments(query)
      return { data, total }
    } finally {
      await client.close()
    }
  }
}
