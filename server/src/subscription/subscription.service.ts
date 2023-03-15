import { Injectable, Logger } from '@nestjs/common'
import {
  BundleSubscriptionOption,
  Subscription,
  SubscriptionPhase,
  SubscriptionRenewalPhase,
  SubscriptionRenewalPlan,
  SubscriptionState,
} from '@prisma/client'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { PrismaService } from 'src/prisma/prisma.service'
import { BundleService } from 'src/region/bundle.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly bundleService: BundleService,
  ) {}

  async create(
    userid: string,
    appid: string,
    dto: CreateSubscriptionDto,
    option: BundleSubscriptionOption,
  ) {
    // start transaction
    const res = await this.prisma.$transaction(async (tx) => {
      // create subscription
      const subscription = await tx.subscription.create({
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

      // create subscription renewal
      await tx.subscriptionRenewal.create({
        data: {
          subscriptionId: subscription.id,
          duration: option.duration,
          amount: option.price,
          phase: SubscriptionRenewalPhase.Pending,
          lockedAt: TASK_LOCK_INIT_TIME,
          createdBy: userid,
        },
      })

      return subscription
    })

    return res
  }

  async findAll(userid: string) {
    const res = await this.prisma.subscription.findMany({
      where: { createdBy: userid },
      include: { application: true },
    })

    return res
  }

  async findOne(userid: string, id: string) {
    const res = await this.prisma.subscription.findUnique({
      where: { id },
      include: { application: true },
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
