import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'assert'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import { Account, BaseState } from './entities/account'
import { ObjectId, ClientSession } from 'mongodb'
import { GenerateGiftCode, GenerateInviteCode } from 'src/utils/random'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from './entities/account-charge-order'
import { GiftCode, CodePrefix } from './entities/account-gift-code'
import { AccountTransaction } from './entities/account-transaction'
import { AccountChargeReward } from './entities/account-charge-reward'
import {
  InviteCode,
  InviteCodeState,
  InviteRelation,
} from 'src/authentication/entities/invite-code'
import { InvitationProfitAmount } from './entities/invitation-profit-amount'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly wechatPayService: WeChatPayService,
    private readonly chanelService: PaymentChannelService,
  ) {}

  async create(userid: ObjectId): Promise<Account> {
    await this.db.collection<Account>('Account').insertOne({
      balance: 0,
      state: BaseState.Active,
      createdBy: new ObjectId(userid),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.findOne(userid)
  }

  async findOne(userid: ObjectId) {
    const account = await this.db
      .collection<Account>('Account')
      .findOne({ createdBy: new ObjectId(userid) })

    if (account) {
      return account
    }

    return await this.create(userid)
  }

  async chargeWithTransaction(
    accountId: ObjectId,
    amount: number,
    message: string,
  ) {
    const client = SystemDatabase.client
    const session = client.startSession()
    session.startTransaction()

    try {
      const result = await this.chargeWithSession(
        accountId,
        amount,
        message,
        session,
      )
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async chargeWithSession(
    accountId: ObjectId,
    amount: number,
    message: string,
    session: ClientSession,
  ) {
    const _amount = Math.round(amount * 100)

    // update account balance
    const res = await this.db
      .collection<Account>('Account')
      .findOneAndUpdate(
        { _id: accountId },
        { $inc: { balance: _amount }, $set: { updatedAt: new Date() } },
        { session, returnDocument: 'after' },
      )

    // add transaction record
    await this.db
      .collection<AccountTransaction>('AccountTransaction')
      .insertOne(
        {
          accountId: accountId,
          amount: _amount,
          balance: res.value.balance,
          message: message,
          createdAt: new Date(),
        },
        { session },
      )

    return res.value
  }

  async createChargeOrder(
    userid: ObjectId,
    amount: number,
    currency: Currency,
    channel: PaymentChannelType,
  ) {
    const account = await this.findOne(userid)
    assert(account, 'Account not found')

    // create charge order
    const res = await this.db
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

    return await this.findOneChargeOrder(userid, res.insertedId)
  }

  async findOneChargeOrder(userid: ObjectId, id: ObjectId) {
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

  async findAllChargeRewards() {
    const rewards = await this.db
      .collection<AccountChargeReward>('AccountChargeReward')
      .find(
        {},
        {
          sort: {
            amount: 1,
          },
        },
      )
      .toArray()

    return rewards
  }

  // gift code
  async useGiftCode(userid: ObjectId, code: string) {
    const client = SystemDatabase.client
    const session = client.startSession()

    const giftCode = await this.findOneGiftCode(code)
    const account = await this.findOne(userid)

    try {
      session.startTransaction()
      // update account balance
      const res = await this.db.collection<Account>('Account').findOneAndUpdate(
        { _id: account._id },
        {
          $inc: { balance: giftCode.creditAmount },
          $set: { updatedAt: new Date() },
        },
        { session, returnDocument: 'after' },
      )

      // add transaction record
      const transaction = await this.db
        .collection<AccountTransaction>('AccountTransaction')
        .insertOne(
          {
            accountId: account._id,
            amount: giftCode.creditAmount,
            balance: res.value.balance,
            message: 'Gift Code Redemption',
            createdAt: new Date(),
          },
          { session },
        )

      // void gift code
      await this.db.collection<GiftCode>('GiftCode').findOneAndUpdate(
        {
          _id: giftCode._id,
        },
        {
          $set: {
            used: true,
            usedAt: new Date(),
            usedBy: account._id,
            transactionId: transaction.insertedId,
          },
        },
        { session },
      )

      await session.commitTransaction()

      return res.value
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  async findOneGiftCode(code: string, used = false): Promise<GiftCode | null> {
    const giftCode = await this.db.collection<GiftCode>('GiftCode').findOne({
      code: code,
      used: used,
    })

    return giftCode
  }

  // delete an unused gift code
  async deleteOneGiftCode(code: string, used = false): Promise<any> {
    const giftCode = await this.db.collection<GiftCode>('GiftCode').deleteOne({
      code: code,
      used: used,
    })
    return giftCode
  }

  async generateGiftCode(
    creditAmount: number,
    prefix: keyof typeof CodePrefix,
  ): Promise<GiftCode | null> {
    if (CodePrefix[prefix] === undefined) {
      throw new Error(`Invalid prefix: ${prefix}`)
    }

    while (true) {
      const nanoid = GenerateGiftCode()
      const code = `${CodePrefix[prefix]}-${nanoid}`
      const found = await this.db
        .collection<GiftCode>('GiftCode')
        .findOne({ code })

      if (!found) {
        const res = await this.db.collection<GiftCode>('GiftCode').insertOne({
          code: code,
          creditAmount: creditAmount,
          used: false,
          createdAt: new Date(),
        })
        const giftCode = await this.db
          .collection<GiftCode>('GiftCode')
          .findOne({ _id: res.insertedId })

        return giftCode
      }
    }
  }
  // invite code
  async generateInviteCode(uid: ObjectId): Promise<InviteCode | null> {
    while (true) {
      const nanoid = GenerateInviteCode()
      const code = `${nanoid}`
      const found = await this.db
        .collection<InviteCode>('InviteCode')
        .findOne({ code })

      if (!found) {
        const res = await this.db
          .collection<InviteCode>('InviteCode')
          .insertOne({
            uid,
            code,
            state: InviteCodeState.Enabled,
            createdAt: new Date(),
            updatedAt: new Date(),
          })

        const inviteCode = await this.db
          .collection<InviteCode>('InviteCode')
          .findOne({ _id: res.insertedId })

        return inviteCode
      }
    }
  }
  async findOneInviteCode(uid: ObjectId): Promise<InviteCode | null> {
    const inviteCode = await this.db
      .collection<InviteCode>('InviteCode')
      .findOne({
        uid,
      })

    return inviteCode
  }

  async getInviteProfit(uid: ObjectId, page: number, pageSize: number) {
    const inviteProfit = await this.db
      .collection<InvitationProfitAmount>('Setting')
      .findOne({
        settingName: 'invitation Profit Amount',
      })

    const pipe = [
      {
        $match: {
          invitedBy: uid,
        },
      },
      {
        $lookup: {
          from: 'User',
          localField: 'uid',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<InviteRelation>('InviteRelation')
      .countDocuments({ invitedBy: uid })

    const inviteCodeProfits = await this.db
      .collection<InviteRelation>('InviteRelation')
      .aggregate(pipe)
      .toArray()

    inviteCodeProfits.forEach((item) => {
      item.profit = inviteProfit ? inviteProfit.amount : 0
      item.user[0].username = item.users[0].username.slice(0, 3)
      item.user[0].email = null
      item.user[0].phone = null
    })

    const res = {
      list: inviteCodeProfits,
      total,
      page,
      pageSize,
    }

    return res
  }
}
