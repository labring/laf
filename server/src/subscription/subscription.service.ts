import { Injectable, Logger } from '@nestjs/common'
import {
  Bundle,
  BundleSubscriptionOption,
  Subscription,
  SubscriptionPhase,
  SubscriptionRenewalPhase,
  SubscriptionRenewalPlan,
  SubscriptionState,
} from '@prisma/client'
import * as assert from 'assert'
import { ONE_MONTH_IN_SECONDS, TASK_LOCK_INIT_TIME } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'
import { BundleService } from 'src/region/bundle.service'
import { PriceRound } from 'src/utils/number'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'
import { RenewSubscriptionDto } from './dto/renew-subscription.dto'

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: BundleService,
  ) {}

  async create(userid: string, appid: string, dto: CreateSubscriptionDto) {
    const res = await this.prisma.subscription.create({
      data: {
        input: {
          name: dto.name,
          state: dto.state,
          regionId: dto.regionId,
          runtimeId: dto.runtimeId,
        },
        appid: appid,
        bundleId: dto.bundleId,
        phase: SubscriptionPhase.Pending,
        renewalPlan: SubscriptionRenewalPlan.Manual,
        expiredAt: new Date(),
        lockedAt: TASK_LOCK_INIT_TIME,
        createdBy: userid,
      },
    })

    return res
  }

  async findAll(userid: string) {
    const res = await this.prisma.subscription.findMany({
      where: { createdBy: userid },
    })

    return res
  }

  async findOne(userid: string, id: string) {
    const res = await this.prisma.subscription.findUnique({
      where: { id },
    })

    return res
  }

  async findOneByAppid(appid: string) {
    const res = await this.prisma.subscription.findUnique({
      where: {
        appid,
      },
    })

    return res
  }

  async remove(userid: string, id: string) {
    const res = await this.prisma.subscription.updateMany({
      where: { id, createdBy: userid, state: SubscriptionState.Created },
      data: { state: SubscriptionState.Deleted },
    })

    return res
  }

  /**
   * Calculate renewal price
   * - calculate price amount based on bundle price and duration:
   *   - price per day = bundle price / 31
   *   - price amount = price per day * (duration / 3600 / 24 )
   */
  async getRenewalPrice(option: BundleSubscriptionOption, duration: number) {
    const price = Number(option.specialPrice || option.price)
    const months = PriceRound(duration / ONE_MONTH_IN_SECONDS)
    const priceAmount = PriceRound(price * months)
    return priceAmount
  }

  /**
   * Renew a subscription by creating a subscription renewal
   */
  async renew(
    subscription: Subscription,
    duration: number,
    priceAmount: number,
  ) {
    // create subscription renewal
    const res = await this.prisma.subscriptionRenewal.create({
      data: {
        subscriptionId: subscription.id,
        duration: duration,
        amount: priceAmount,
        phase: SubscriptionRenewalPhase.Pending,
        lockedAt: TASK_LOCK_INIT_TIME,
        createdBy: subscription.createdBy,
      },
    })

    return res
  }
}
