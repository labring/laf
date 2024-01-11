import { Injectable, Logger } from '@nestjs/common'
import { CN_PUBLISHED_POLICIES } from 'src/constants'
import { DatabaseService } from '../database.service'
import { CreatePolicyDto } from '../dto/create-policy.dto'
import { UpdatePolicyDto } from '../dto/update-policy.dto'
import { SystemDatabase } from '../../system-database'
import {
  DatabasePolicy,
  DatabasePolicyRule,
  DatabasePolicyWithRules,
} from '../entities/database-policy'
import * as assert from 'assert'
import { DedicatedDatabaseService } from '../dedicated-database/dedicated-database.service'

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly dedicatedDatabaseService: DedicatedDatabaseService,
  ) {}

  async create(appid: string, dto: CreatePolicyDto) {
    await this.db.collection<DatabasePolicy>('DatabasePolicy').insertOne({
      appid,
      name: dto.name,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.publish(appid, dto.name)
  }

  async count(appid: string) {
    const res = await this.db
      .collection<DatabasePolicy>('DatabasePolicy')
      .countDocuments({ appid })

    return res
  }

  async findAll(appid: string) {
    const res = await this.db
      .collection('DatabasePolicy')
      .aggregate<DatabasePolicyWithRules>()
      .match({ appid })
      .lookup({
        from: 'DatabasePolicyRule',
        let: { name: '$name', appid: '$appid' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$appid', '$$appid'] },
                  { $eq: ['$policyName', '$$name'] },
                ],
              },
            },
          },
        ],
        as: 'rules',
      })
      .toArray()

    return res
  }

  async findOne(appid: string, name: string) {
    const policy = await this.db
      .collection<DatabasePolicy>('DatabasePolicy')
      .findOne({ appid, name })

    if (!policy) {
      return null
    }

    const rules = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .find({ appid, policyName: name })
      .toArray()

    return {
      ...policy,
      rules,
    } as DatabasePolicyWithRules
  }

  async updateOne(appid: string, name: string, dto: UpdatePolicyDto) {
    const res = await this.db
      .collection<DatabasePolicy>('DatabasePolicy')
      .findOneAndUpdate(
        { appid, name },
        { $set: { injector: dto.injector, updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    await this.publish(appid, name)
    return res.value
  }

  async removeOne(appid: string, name: string) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        await this.db
          .collection<DatabasePolicy>('DatabasePolicy')
          .deleteOne({ appid, name }, { session })

        await this.db
          .collection<DatabasePolicyRule>('DatabasePolicyRule')
          .deleteMany({ appid, policyName: name }, { session })

        await this.unpublish(appid, name)
      })
    } finally {
      await session.endSession()
    }
  }

  async removeAll(appid: string) {
    const client = SystemDatabase.client
    const session = client.startSession()

    try {
      await session.withTransaction(async () => {
        await this.db
          .collection<DatabasePolicy>('DatabasePolicy')
          .deleteMany({ appid }, { session })

        await this.db
          .collection<DatabasePolicyRule>('DatabasePolicyRule')
          .deleteMany({ appid }, { session })
      })
    } finally {
      await session.endSession()
    }
  }

  async publish(appid: string, name: string) {
    const policy = await this.findOne(appid, name)
    assert(policy, `policy ${name} not found`)

    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(appid)) ||
      (await this.databaseService.findAndConnect(appid))

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
      await session.endSession()
      await client.close()
      return policy
    }
  }

  async unpublish(appid: string, name: string) {
    const { db, client } =
      (await this.dedicatedDatabaseService.findAndConnect(appid)) ||
      (await this.databaseService.findAndConnect(appid))
    try {
      const coll = db.collection(CN_PUBLISHED_POLICIES)
      await coll.deleteOne({ name })
    } finally {
      await client.close()
    }
  }
}
