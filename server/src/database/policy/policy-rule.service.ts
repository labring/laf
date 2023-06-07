import { Injectable } from '@nestjs/common'
import { CreatePolicyRuleDto } from '../dto/create-rule.dto'
import { UpdatePolicyRuleDto } from '../dto/update-rule.dto'
import { PolicyService } from './policy.service'
import { SystemDatabase } from '../../system-database'
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

    await this.policyService.publish(appid, policyName)
    return await this.findOne(appid, policyName, dto.collectionName)
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
    const res = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .findOneAndUpdate(
        { appid, policyName, collectionName },
        { $set: { value: JSON.parse(dto.value), updatedAt: new Date() } },
        { returnDocument: 'after' },
      )

    await this.policyService.publish(appid, policyName)
    return res.value
  }

  async removeOne(appid: string, policyName: string, collectionName: string) {
    const res = await this.db
      .collection<DatabasePolicyRule>('DatabasePolicyRule')
      .findOneAndDelete({ appid, policyName, collectionName })

    await this.policyService.publish(appid, policyName)
    return res.value
  }
}
