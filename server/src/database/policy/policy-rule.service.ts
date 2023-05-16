import { Injectable } from '@nestjs/common'
import * as assert from 'node:assert'
import { CreatePolicyRuleDto } from '../dto/create-rule.dto'
import { UpdatePolicyRuleDto } from '../dto/update-rule.dto'
import { PolicyService } from './policy.service'
import { SystemDatabase } from '../system-database'
import { DatabasePolicyRule } from '../entities/database-policy'

@Injectable()
export class PolicyRuleService {
  private readonly db = SystemDatabase.db
  constructor(private readonly policyService: PolicyService) {}

  async create(appid: string, policyName: string, dto: CreatePolicyRuleDto) {
    await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .insertOne({
        appid,
        policyName,
        collectionName: dto.collectionName,
        value: JSON.parse(dto.value),
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return policy
  }

  async count(appid: string, policyName: string) {
    const res = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .countDocuments({ appid, policyName })

    return res
  }

  async findAll(appid: string, policyName: string) {
    const res = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .find({ appid, policyName })
      .toArray()

    return res
  }

  async findOne(appid: string, policyName: string, collectionName: string) {
    const doc = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .findOne({ appid, policyName, collectionName })

    return doc
  }

  async updateOne(
    appid: string,
    policyName: string,
    collectionName: string,
    dto: UpdatePolicyRuleDto,
  ) {
    await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .findOneAndUpdate(
        { appid, policyName, collectionName },
        { $set: { value: JSON.parse(dto.value), updatedAt: new Date() } },
      )

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return policy
  }

  async removeOne(appid: string, policyName: string, collectionName: string) {
    await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .deleteOne({ appid, policyName, collectionName })

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return policy
  }
}
