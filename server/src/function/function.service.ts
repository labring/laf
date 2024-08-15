import { Injectable, Logger } from '@nestjs/common'
import { compileTs2js } from '../utils/lang'
import {
  APPLICATION_SECRET_KEY,
  CN_PUBLISHED_FUNCTIONS,
  TASK_LOCK_INIT_TIME,
} from '../constants'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import * as assert from 'node:assert'
import { JwtService } from '@nestjs/jwt'
import { CompileFunctionDto } from './dto/compile-function.dto'
import { DatabaseService } from 'src/database/database.service'
import { SystemDatabase } from 'src/system-database'
import { ClientSession, ObjectId } from 'mongodb'
import { CloudFunction } from './entities/cloud-function'
import { ApplicationConfiguration } from 'src/application/entities/application-configuration'
import { CloudFunctionHistory } from './entities/cloud-function-history'
import { TriggerService } from 'src/trigger/trigger.service'
import { TriggerPhase } from 'src/trigger/entities/cron-trigger'
import { UpdateFunctionDebugDto } from './dto/update-function-debug.dto'
import { FunctionRecycleBinService } from 'src/recycle-bin/cloud-function/function-recycle-bin.service'
import { HttpService } from '@nestjs/axios'
import { RegionService } from 'src/region/region.service'
import { GetApplicationNamespace } from 'src/utils/getter'
import { Region } from 'src/region/entities/region'
import { DedicatedDatabaseService } from 'src/database/dedicated-database/dedicated-database.service'

@Injectable()
export class FunctionService {
  private readonly logger = new Logger(FunctionService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dedicatedDatabaseService: DedicatedDatabaseService,
    private readonly jwtService: JwtService,
    private readonly triggerService: TriggerService,
    private readonly functionRecycleBinService: FunctionRecycleBinService,
    private readonly httpService: HttpService,
    private readonly regionService: RegionService,
  ) {}
  async create(appid: string, userid: ObjectId, dto: CreateFunctionDto) {
    await this.db.collection<CloudFunction>('CloudFunction').insertOne({
      appid,
      name: dto.name,
      source: {
        code: dto.code,
        compiled: compileTs2js(dto.code, dto.name),
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

    await this.addOneHistoryRecord(fn, 'created')
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
    // update function name
    if (dto.newName) {
      const client = SystemDatabase.client
      const session = client.startSession()

      const found = await this.findOne(func.appid, dto.newName)
      if (found) {
        return new Error(`Function name ${found.name} already exists`)
      }

      try {
        session.startTransaction()

        const fn = await this.db
          .collection<CloudFunction>('CloudFunction')
          .findOneAndUpdate(
            { appid: func.appid, name: func.name },
            {
              $set: {
                name: dto.newName,
                'source.compiled': compileTs2js(func.source.code, dto.newName),
                desc: dto.description,
                methods: dto.methods,
                tags: dto.tags || [],
                updatedAt: new Date(),
              },
            },
            { session, returnDocument: 'after' },
          )

        // publish
        await this.publish(fn.value, func.name)

        // trigger
        const triggers = await this.triggerService.findAllByTarget(
          func.appid,
          func.name,
        )
        if (triggers.length !== 0) {
          const triggersToInsert = triggers.map((doc) => ({
            appid: doc.appid,
            desc: doc.desc,
            cron: doc.cron,
            target: dto.newName, // set to new function name
            state: doc.state,
            phase: TriggerPhase.Creating,
            lockedAt: TASK_LOCK_INIT_TIME,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(),
          }))
          await this.triggerService.removeAllByTarget(
            func.appid,
            func.name,
            session,
          )
          await this.triggerService.createMany(triggersToInsert, session)
        }
        await session.commitTransaction()
        return fn.value
      } catch (error) {
        await session.abortTransaction()
        this.logger.error(error)
        throw error
      } finally {
        await session.endSession()
      }
    }

    await this.db.collection<CloudFunction>('CloudFunction').updateOne(
      { appid: func.appid, name: func.name },
      {
        $set: {
          source: {
            code: dto.code,
            compiled: compileTs2js(dto.code, func.name),
            version: func.source.version + 1,
          },
          desc: dto.description,
          methods: dto.methods,
          tags: dto.tags || [],
          updatedAt: new Date(),
        },
      },
    )

    const fn = await this.findOne(func.appid, func.name)
    await this.addOneHistoryRecord(fn, dto.changelog)
    await this.publish(fn)

    return fn
  }

  async updateOneDebug(func: CloudFunction, dto: UpdateFunctionDebugDto) {
    await this.db.collection<CloudFunction>('CloudFunction').updateOne(
      { appid: func.appid, name: func.name },
      {
        $set: {
          params: dto.params,
        },
      },
    )

    const fn = await this.findOne(func.appid, func.name)
    return fn
  }

  async removeOne(func: CloudFunction) {
    const client = SystemDatabase.client
    const session = client.startSession()
    try {
      session.startTransaction()

      const { appid, name } = func

      const res = await this.db
        .collection<CloudFunction>('CloudFunction')
        .findOneAndDelete({ appid, name }, { session })

      await this.deleteHistory(res.value, session)

      // add this function to recycle bin
      await this.functionRecycleBinService.addToRecycleBin(res.value, session)

      await this.unpublish(appid, name)

      await session.commitTransaction()
      return res.value
    } catch (err) {
      await session.abortTransaction()
      this.logger.error(err)
      throw err
    } finally {
      await session.endSession()
    }
  }

  async removeAll(appid: string) {
    const res = await this.db
      .collection<CloudFunction>('CloudFunction')
      .deleteMany({ appid })

    await this.deleteHistoryAll(appid)

    return res
  }

  async publish(func: CloudFunction, oldFuncName?: string) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(func.appid)) ||
      (await this.databaseService.findAndConnect(func.appid))

    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
        await coll.deleteMany(
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

  async publishMany(funcs: CloudFunction[]) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(funcs[0].appid)) ||
      (await this.databaseService.findAndConnect(funcs[0].appid))

    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
        const funcNames = funcs.map((func) => func.name)
        await coll.deleteMany({ name: { $in: funcNames } }, { session })
        await coll.insertMany(funcs, { session })
      })
    } finally {
      await session.endSession()
      await client.close()
    }
  }

  async publishFunctionTemplateItems(funcs: CloudFunction[]) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(funcs[0].appid)) ||
      (await this.databaseService.findAndConnect(funcs[0].appid))

    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
        // this is used by function template service, don't need to delete many
        await coll.insertMany(funcs, { session })
      })
    } finally {
      await session.endSession()
      await client.close()
    }
  }

  async unpublish(appid: string, name: string) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(appid)) ||
      (await this.databaseService.findAndConnect(appid))
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
        compiled: compileTs2js(dto.code, func.name),
        version: func.source.version + 1,
      },
      updatedAt: new Date(),
    }
    return data
  }

  async generateRuntimeToken(
    appid: string,
    type: 'trigger' | 'develop' | 'openapi',
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
  getInClusterRuntimeUrl(region: Region, appid: string) {
    const serviceName = appid
    const namespace = GetApplicationNamespace(region, appid)
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
    const region = await this.regionService.findByAppId(appid)
    if (!region?.logServerConf?.apiUrl) {
      return {
        data: [],
        total: 0,
      }
    }

    const res = await this.httpService.axiosRef.get(
      `${region.logServerConf.apiUrl}/function/log`,
      {
        params: {
          ...params,
          appid,
        },
        headers: {
          'x-token': region.logServerConf.secret,
        },
      },
    )
    return res.data
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

  async addOneHistoryRecord(func: CloudFunction, changelog = '') {
    await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .insertOne({
        appid: func.appid,
        functionId: func._id,
        source: {
          code: func.source.code,
        },
        createdAt: new Date(),
        changelog,
      })
  }

  async deleteHistory(func: CloudFunction, session?: ClientSession) {
    const res = await this.db
      .collection<CloudFunctionHistory>('CloudFunctionHistory')
      .deleteMany(
        {
          functionId: func._id,
        },
        { session },
      )
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
