import { Injectable, Logger } from '@nestjs/common'
import { CloudFunction, Prisma } from '@prisma/client'
import { compileTs2js } from '../utils/lang'
import {
  APPLICATION_SECRET_KEY,
  CN_FUNCTION_LOGS,
  CN_PUBLISHED_FUNCTIONS,
} from '../constants'
import { PrismaService } from '../prisma.service'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import * as assert from 'node:assert'
import { JwtService } from '@nestjs/jwt'
import { CompileFunctionDto } from './dto/compile-function.dto'
import { DatabaseService } from 'src/database/database.service'

@Injectable()
export class FunctionService {
  private readonly logger = new Logger(FunctionService.name)
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async create(appid: string, userid: string, dto: CreateFunctionDto) {
    const data: Prisma.CloudFunctionCreateInput = {
      appid,
      name: dto.name,
      source: {
        code: dto.code,
        compiled: compileTs2js(dto.code),
        version: 0,
      },
      desc: dto.description,
      websocket: dto.websocket,
      createdBy: userid,
      methods: dto.methods,
      tags: dto.tags || [],
    }
    const res = await this.prisma.cloudFunction.create({ data })
    await this.publish(res)
    return res
  }

  async findAll(appid: string) {
    const res = await this.prisma.cloudFunction.findMany({
      where: { appid },
    })

    return res
  }

  async count(appid: string) {
    const res = await this.prisma.cloudFunction.count({ where: { appid } })
    return res
  }

  async findOne(appid: string, name: string) {
    const res = await this.prisma.cloudFunction.findUnique({
      where: { appid_name: { appid, name } },
    })
    return res
  }

  async update(func: CloudFunction, dto: UpdateFunctionDto) {
    const data: Prisma.CloudFunctionUpdateInput = {
      source: {
        code: dto.code,
        compiled: compileTs2js(dto.code),
        version: func.source.version + 1,
      },
      desc: dto.description,
      websocket: dto.websocket,
      methods: dto.methods,
      tags: dto.tags || [],
    }
    const res = await this.prisma.cloudFunction.update({
      where: { appid_name: { appid: func.appid, name: func.name } },
      data,
    })

    await this.publish(res)
    return res
  }

  async remove(func: CloudFunction) {
    const { appid, name } = func
    const res = await this.prisma.cloudFunction.delete({
      where: { appid_name: { appid, name } },
    })
    await this.unpublish(appid, name)
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

  async getDebugFunctionToken(appid: string) {
    const conf = await this.prisma.applicationConfiguration.findUnique({
      where: { appid },
    })

    // get secret from envs
    const secret = conf?.environments.find(
      (env) => env.name === APPLICATION_SECRET_KEY,
    )
    assert(secret?.value, 'application secret not found')

    // generate token
    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days

    const token = this.jwtService.sign(
      { appid, type: 'debug', exp },
      { secret: secret.value },
    )
    return token
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
          sort: { created_at: -1 },
        })
        .toArray()

      const total = await coll.countDocuments(query)
      return {
        data,
        total,
      }
    } finally {
      await client.close()
    }
  }
}
