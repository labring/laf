import { Injectable, Logger } from '@nestjs/common'
import * as assert from 'assert'
import { WeChatPayService } from './payment/wechat-pay.service'
import { PaymentChannelService } from './payment/payment-channel.service'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import { Account, BaseState } from './entities/account'
import { ObjectId, ClientSession } from 'mongodb'
import { GenerateInviteCode } from 'src/utils/random'
import {
  AccountChargeOrder,
  AccountChargePhase,
  Currency,
  PaymentChannelType,
} from './entities/account-charge-order'
import { GiftCode } from './entities/account-gift-code'
import { AccountTransaction } from './entities/account-transaction'
import { AccountChargeReward } from './entities/account-charge-reward'
import {
  InviteCode,
  InviteCodeState,
  InviteRelation,
} from 'src/authentication/entities/invite-code'
import { AccountChargeOrderQuery } from './interface/account-query.interface'
import { Setting, SettingKey } from 'src/setting/entities/setting'

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly wechatPayService: WeChatPayService,
    private readonly chanelService: PaymentChannelService,
  ) {}

  async create(userid: ObjectId): Promise<Account> {
    // get signup Profit Amount
    let amount = 0
    const signupBonus = await this.db.collection<Setting>('Setting').findOne({
      key: SettingKey.SignupBonus,
    })
    if (signupBonus) {
      amount = parseFloat(signupBonus.value)
    }
    await this.db.collection<Account>('Account').insertOne({
      balance: amount,
      state: BaseState.Active,
      createdBy: userid,
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
    session: ClientSession,
    additionalParams?: Partial<AccountTransaction>,
  ) {
    // update account balance
    const res = await this.db
      .collection<Account>('Account')
      .findOneAndUpdate(
        { _id: accountId },
        { $inc: { balance: amount }, $set: { updatedAt: new Date() } },
        { session, returnDocument: 'after' },
      )

    assert(res.value, `account not found: ${accountId}`)

    if (res.value.balance > 0 && res.value.owedAt) {
      await this.db
        .collection<Account>('Account')
        .updateOne({ _id: accountId }, { $unset: { owedAt: '' } }, { session })
    }

    if (additionalParams) {
      const transaction = await this.db
        .collection<AccountTransaction>('AccountTransaction')
        .insertOne(
          {
            accountId: accountId,
            amount: additionalParams.reward
              ? amount - additionalParams.reward
              : amount,
            reward: additionalParams.reward,
            balance: res.value.balance,
            message: message,
            orderId: additionalParams.orderId,
            createdAt: new Date(),
          },
          { session },
        )

      return { account: res.value, transaction: transaction }
    }

    // add transaction record
    const transaction = await this.db
      .collection<AccountTransaction>('AccountTransaction')
      .insertOne(
        {
          accountId: accountId,
          amount: amount,
          balance: res.value.balance,
          message: message,
          createdAt: new Date(),
        },
        { session },
      )

    return { account: res.value, transaction: transaction }
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

  async getAllChargeOrders(
    userid: ObjectId,
    condition: AccountChargeOrderQuery,
  ) {
    const query = {
      createdBy: userid,
      phase: condition.phase ? condition.phase : AccountChargePhase.Paid,
    }

    if (condition.id) {
      query['_id'] = condition.id
    }

    if (condition.channel) {
      query['channel'] = condition.channel
    }

    if (condition.startTime) {
      query['createdAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['createdAt']['$lte'] = condition.endTime
      } else {
        query['createdAt'] = { $lte: condition.endTime }
      }
    }

    const total = await this.db
      .collection<AccountChargeOrder>('AccountChargeOrder')
      .countDocuments(query)

    const orders = await this.db
      .collection<AccountChargeOrder>('AccountChargeOrder')
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'AccountTransaction',
            localField: '_id',
            foreignField: 'orderId',
            as: 'transaction',
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (condition.page - 1) * condition.pageSize },
        { $limit: condition.pageSize },
        { $unwind: { path: '$transaction', preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            reward: '$transaction.reward',
          },
        },
        {
          $project: {
            transaction: 0,
          },
        },
      ])
      .toArray()

    const res = {
      total,
      list: orders,
      page: condition.page,
      pageSize: condition.pageSize,
    }

    return res
  }

  async getUserRecharge(userid: ObjectId, condition: AccountChargeOrderQuery) {
    const query = {
      createdBy: userid,
      phase: AccountChargePhase.Paid,
    }

    if (condition.startTime) {
      query['createdAt'] = { $gte: condition.startTime }
    }

    if (condition.endTime) {
      if (condition.startTime) {
        query['createdAt']['$lte'] = condition.endTime
      } else {
        query['createdAt'] = { $lte: condition.endTime }
      }
    }

    const rechargeAmount = await this.db
      .collection<AccountChargeOrder>('AccountChargeOrder')
      .aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount',
            },
          },
        },
      ])
      .toArray()
    return rechargeAmount.length > 0 ? rechargeAmount[0].totalAmount : 0
  }

  // gift code
  async useGiftCode(userid: ObjectId, code: string) {
    const client = SystemDatabase.client
    const session = client.startSession()

    const giftCode = await this.findOneGiftCode(code)
    const account = await this.findOne(userid)

    try {
      session.startTransaction()
      // add gift-code charge order
      await this.db
        .collection<AccountChargeOrder>('AccountChargeOrder')
        .insertOne(
          {
            accountId: account._id,
            amount: giftCode.creditAmount,
            currency: Currency.CNY,
            phase: AccountChargePhase.Paid,
            channel: PaymentChannelType.GiftCode,
            createdBy: new ObjectId(userid),
            lockedAt: TASK_LOCK_INIT_TIME,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          { session },
        )

      // update account balance and add transaction record

      const res = await this.chargeWithTransaction(
        account._id,
        giftCode.creditAmount,
        'Gift code redemption',
        session,
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
            transactionId: res.transaction.insertedId,
          },
        },
        { session },
      )

      await session.commitTransaction()

      return res.account
    } catch (error) {
      await session.abortTransaction()
      this.logger.error(error)
      throw error
    } finally {
      await session.endSession()
    }
  }

  async findOneGiftCode(code: string): Promise<GiftCode | null> {
    const giftCode = await this.db.collection<GiftCode>('GiftCode').findOne({
      code: code,
    })
    return giftCode
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
    const query = {
      invitedBy: uid,
    }
    const pipe = [
      {
        $match: query,
      },
      {
        $lookup: {
          from: 'User',
          let: { userId: '$uid' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$userId'],
                },
              },
            },
            {
              $project: { username: 1, _id: 0 },
            },
          ],
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'AccountTransaction',
          let: { transactionId: '$transactionId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$_id', '$$transactionId'],
                },
              },
            },
            {
              $project: { amount: 1, _id: 0 },
            },
          ],
          as: 'transaction',
        },
      },
      {
        $addFields: {
          username: { $arrayElemAt: ['$user.username', 0] },
          inviteProfit: { $arrayElemAt: ['$transaction.amount', 0] },
        },
      },
      {
        $project: {
          user: 0,
          transaction: 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * pageSize },
      { $limit: pageSize },
    ]

    const total = await this.db
      .collection<InviteRelation>('InviteRelation')
      .countDocuments(query)

    const inviteCodeProfits = await this.db
      .collection<InviteRelation>('InviteRelation')
      .aggregate(pipe)
      .toArray()

    const res = {
      list: inviteCodeProfits,
      total,
      page,
      pageSize,
    }

    return res
  }
}
