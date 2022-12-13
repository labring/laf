import { Injectable } from '@nestjs/common'
import { CloudFunction, Prisma } from '@prisma/client'
import { compileTs2js } from '../utils/lang'
import { APPLICATION_SECRET_KEY, CN_PUBLISHED_FUNCTIONS } from '../constants'
import { DatabaseCoreService } from '../core/database.cr.service'
import { PrismaService } from '../prisma.service'
import { CreateFunctionDto } from './dto/create-function.dto'
import { UpdateFunctionDto } from './dto/update-function.dto'
import * as assert from 'node:assert'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class FunctionService {
  constructor(
    private readonly db: DatabaseCoreService,
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
      websocket: false,
      createdBy: userid,
      methods: dto.methods,
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
      websocket: false,
      methods: dto.methods,
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
    const { db, client } = await this.db.findAndConnect(func.appid)
    const session = client.startSession()
    await session.withTransaction(async () => {
      const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
      await coll.deleteOne({ name: func.name }, { session })
      await coll.insertOne(func, { session })
    })
  }

  async unpublish(appid: string, name: string) {
    const { db, client } = await this.db.findAndConnect(appid)
    const session = client.startSession()
    await session.withTransaction(async () => {
      const coll = db.collection(CN_PUBLISHED_FUNCTIONS)
      await coll.deleteOne({ name }, { session })
    })
  }

  compile(func: CloudFunction) {
    const code = func.source.code
    func.source.compiled = compileTs2js(code)
    return func
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
}
