import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import * as assert from 'assert'
import {
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from '@prisma/client'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatPayService: WeChatPayService,
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
    currency: Currency,
    channel: PaymentChannelType,
  ) {
    const account = await this.findOne(userid)
    assert(account, 'Account not found')

    // create charge order
    const order = await this.prisma.accountChargeOrder.create({
      data: {
        accountId: account.id,
        amount,
        currency: currency,
        phase: AccountChargePhase.Pending,
        channel: channel,
        createdBy: userid,
        lockedAt: TASK_LOCK_INIT_TIME,
      },
    })

    return order
  }

  async findOneChargeOrder(userid: string, id: string) {
    const order = await this.prisma.accountChargeOrder.findFirst({
      where: { id, createdBy: userid },
    })

    return order
  }

  async pay(
    channel: PaymentChannelType,
    orderNumber: string,
    amount: number,
    currency: Currency,
    description = 'laf account charge',
  ) {
    // webchat pay
    if (channel === PaymentChannelType.WeChat) {
      const spec = await this.chanelService.getWeChatPaySpec()
      const result = await this.wechatPayService.send(spec, {
        mchid: spec.mchid,
        appid: spec.appid,
        description,
        out_trade_no: orderNumber,
        notify_url: this.wechatPayService.getNotifyUrl(),
        amount: {
          total: amount,
          currency: currency,
        },
      })
      return result
    }

    throw new Error('Unsupported payment channel')
  }
}
