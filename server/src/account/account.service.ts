import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as assert from 'assert'
import { AccountChargePhase, PaymentChannelType } from '@prisma/client'
import { WeChatPaymentService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatPayService: WeChatPaymentService,
    private readonly chanelService: PaymentChannelService,
  ) {}

  async create(userid: string) {
    const account = await this.prisma.account.create({
      data: {
        balance: 0,
        createdBy: userid,
      },
    })

    return account
  }

  async findOne(userid: string) {
    const account = await this.prisma.account.findUnique({
      where: { createdBy: userid },
    })

    if (account) {
      return account
    }

    return this.create(userid)
  }

  async createChargeOrder(
    userid: string,
    amount: number,
    channel: PaymentChannelType,
    channelData: any,
  ) {
    const account = await this.findOne(userid)
    assert(account, 'Account not found')

    // create charge order
    const order = await this.prisma.accountChargeOrder.create({
      data: {
        accountId: account.id,
        amount,
        phase: AccountChargePhase.Pending,
        channel: channel,
        channelData: channelData,
        createdBy: userid,
        lockedAt: TASK_LOCK_INIT_TIME,
      },
    })

    return order
  }

  async pay(channel: PaymentChannelType, amount: number) {
    if (channel === PaymentChannelType.WeChat) {
      const channelSpec = await this.chanelService.getWeChatPaySpec()
      const channelData = await this.wechatPayService.getChannelData(
        amount,
        channelSpec,
      )
      const result = await this.wechatPayService.pay(channelData, channelSpec)
      return { result, channelData }
    }

    throw new Error('Unsupported payment channel')
  }
}
