import { Injectable } from '@nestjs/common'
import { DatabasePolicy } from '@prisma/client'
import { CN_PUBLISHED_POLICIES } from 'src/constants'
import { DatabaseCoreService } from 'src/core/database.cr.service'
import { PrismaService } from 'src/prisma.service'
import { CreatePolicyDto } from './dto/create-policy.dto'
import { UpdatePolicyDto } from './dto/update-policy.dto'

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly db: DatabaseCoreService,
  ) {}

  async create(appid: string, createPolicyDto: CreatePolicyDto) {
    const res = await this.prisma.databasePolicy.create({
      data: {
        appid,
        name: createPolicyDto.name,
        rules: createPolicyDto.rules,
      },
    })

    await this.publish(res)
    return res
  }

  async findAll(appid: string) {
    const res = await this.prisma.databasePolicy.findMany({
      where: {
        appid,
      },
    })
    return res
  }

  async findOne(appid: string, name: string) {
    const res = await this.prisma.databasePolicy.findUnique({
      where: {
        appid_name: {
          appid,
          name,
        },
      },
    })
    return res
  }

  async update(appid: string, name: string, dto: UpdatePolicyDto) {
    const res = await this.prisma.databasePolicy.update({
      where: {
        appid_name: {
          appid,
          name,
        },
      },
      data: {
        rules: dto.rules,
      },
    })

    await this.publish(res)
    return res
  }

  async remove(appid: string, name: string) {
    const res = await this.prisma.databasePolicy.delete({
      where: {
        appid_name: {
          appid,
          name,
        },
      },
    })
    await this.unpublish(appid, name)
    return res
  }

  async publish(policy: DatabasePolicy) {
    const { db, client } = await this.db.findAndConnect(policy.appid)
    const session = client.startSession()
    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_POLICIES)
        await coll.deleteOne({ name: policy.name }, { session })
        await coll.insertOne(policy, { session })
      })
    } finally {
      await client.close()
    }
  }

  async unpublish(appid: string, name: string) {
    const { db, client } = await this.db.findAndConnect(appid)
    try {
      const coll = db.collection(CN_PUBLISHED_POLICIES)
      await coll.deleteOne({ name })
    } finally {
      await client.close()
    }
  }
}
