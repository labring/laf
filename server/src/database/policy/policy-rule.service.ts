import { Injectable } from '@nestjs/common'
import * as assert from 'node:assert'
import { PrismaService } from 'src/prisma.service'
import { CreatePolicyRuleDto } from '../dto/create-rule.dto'
import { UpdatePolicyRuleDto } from '../dto/update-rule.dto'
import { PolicyService } from './policy.service'

@Injectable()
export class PolicyRuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policyService: PolicyService,
  ) {}

  async create(appid: string, policyName: string, dto: CreatePolicyRuleDto) {
    const res = await this.prisma.databasePolicyRule.create({
      data: {
        policy: {
          connect: {
            appid_name: {
              appid,
              name: policyName,
            },
          },
        },
        collectionName: dto.collectionName,
        value: JSON.parse(dto.value),
      },
    })

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return res
  }

  async findAll(appid: string, policyName: string) {
    const res = await this.prisma.databasePolicyRule.findMany({
      where: {
        policy: {
          appid,
          name: policyName,
        },
      },
    })
    return res
  }

  async findOne(appid: string, policyName: string, collectionName: string) {
    const res = await this.prisma.databasePolicyRule.findUnique({
      where: {
        appid_policyName_collectionName: {
          appid,
          policyName,
          collectionName,
        },
      },
    })
    return res
  }

  async update(
    appid: string,
    policyName: string,
    collectionName: string,
    dto: UpdatePolicyRuleDto,
  ) {
    const res = await this.prisma.databasePolicyRule.update({
      where: {
        appid_policyName_collectionName: {
          appid,
          policyName,
          collectionName: collectionName,
        },
      },
      data: {
        value: JSON.parse(dto.value),
      },
    })

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return res
  }

  async remove(appid: string, policyName: string, collectionName: string) {
    const res = await this.prisma.databasePolicyRule.delete({
      where: {
        appid_policyName_collectionName: {
          appid,
          policyName,
          collectionName,
        },
      },
    })

    const policy = await this.policyService.findOne(appid, policyName)
    assert(policy, 'policy not found')
    await this.policyService.publish(policy)
    return res
  }
}
