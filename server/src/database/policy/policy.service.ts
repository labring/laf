import { Injectable } from '@nestjs/common'
import { DatabasePolicy, DatabasePolicyRule } from '@prisma/client'
import { CN_PUBLISHED_POLICIES } from 'src/constants'
import { PrismaService } from 'src/prisma.service'
import { DatabaseService } from '../database.service'
import { CreatePolicyDto } from '../dto/create-policy.dto'
import { UpdatePolicyDto } from '../dto/update-policy.dto'

@Injectable()
export class PolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(appid: string, createPolicyDto: CreatePolicyDto) {
    const res = await this.prisma.databasePolicy.create({
      data: {
        appid,
        name: createPolicyDto.name,
      },
      include: {
        rules: true,
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
      include: {
        rules: true,
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
      include: {
        rules: true,
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
        injector: dto.injector,
      },
      include: {
        rules: true,
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
      include: {
        rules: true,
      },
    })
    await this.unpublish(appid, name)
    return res
  }

  async publish(policy: DatabasePolicy & { rules: DatabasePolicyRule[] }) {
    const { db, client } = await this.databaseService.findAndConnect(
      policy.appid,
    )
    const session = client.startSession()

    const rules = {}
    for (const rule of policy.rules) {
      rules[rule.collectionName] = rule.value
    }

    try {
      await session.withTransaction(async () => {
        const coll = db.collection(CN_PUBLISHED_POLICIES)
        await coll.deleteOne({ name: policy.name }, { session })
        const data = { ...policy, rules }
        await coll.insertOne(data, { session })
      })
    } finally {
      await client.close()
    }
  }

  async unpublish(appid: string, name: string) {
    const { db, client } = await this.databaseService.findAndConnect(appid)
    try {
      const coll = db.collection(CN_PUBLISHED_POLICIES)
      await coll.deleteOne({ name })
    } finally {
      await client.close()
    }
  }
}
