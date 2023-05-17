import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'assert'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { Account, BaseState } from './entities/account'
import { ObjectId } from 'mongodb'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from './entities/account-charge-order'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly wechatPayService: WeChatPayService,
    private readonly chanelService: PaymentChannelService,
  ) {}

  async create(userid: string): Promise<Account> {
    await this.db.collection<Account>('Account').insertOne({
      balance: 0,
      state: BaseState.Active,
      createdBy: new ObjectId(userid),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.findOne(userid)
  }

  async findOne(userid: string) {
    const account = await this.db
      .collection<Account>('Account')
      .findOne({ createdBy: new ObjectId(userid) })

    if (account) {
      return account
    }

    return await this.create(userid)
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
    await this.db
      .collection<AccountChargeOrder>('AccountChargeOrder')
      .insertOne({
        accountId: account._id,
        amount,
        currency: currency,
        phase: AccountChargePhase.Pending,
        channel: channel,
        createdBy: new ObjectId(userid),
        lockedAt: TASK_LOCK_INIT_TIME,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

    return await this.findOneChargeOrder(userid, account._id)
  }

  async findOneChargeOrder(userid: string, id: ObjectId) {
    const order = await this.db
      .collection<AccountChargeOrder>('AccountChargeOrder')
      .findOne({
        _id: id,
        createdBy: new ObjectId(userid),
      })

    return order
  }

  async pay(
    channel: PaymentChannelType,
    orderNumber: ObjectId,
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
        out_trade_no: orderNumber.toString(),
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
