import {
  Account,
  SubscriptionRenewal,
  SubscriptionRenewalPhase,
} from '.prisma/client'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { ObjectId } from 'mongodb'
import { AccountService } from 'src/account/account.service'
import { Subscription } from '@prisma/client'

@Injectable()
export class SubscriptionRenewalTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count

  private readonly logger = new Logger(SubscriptionRenewalTaskService.name)

  constructor(private readonly accountService: AccountService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_SUBSCRIPTION_TASK) {
      return
    }

    // Phase `Pending` -> `Paid`
    this.handlePendingPhase()
  }

  /**
   * Phase `Pending`:
   * 1. Pay the subscription renewal order from account balance (Transaction)
   * 2. Update subscription 'expiredAt' time (Transaction)  (lock document)
   * 3. Update subscription renewal order phase to ‘Paid’ (Transaction)
   */
  async handlePendingPhase() {
    const db = SystemDatabase.db
    const client = SystemDatabase.client

    const doc = await db
      .collection<SubscriptionRenewal>('SubscriptionRenewal')
      .findOneAndUpdate(
        {
          phase: SubscriptionRenewalPhase.Pending,
          lockedAt: { $lte: new Date(Date.now() - this.lockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!doc.value) {
      return
    }

    const renewal = doc.value

    // check account balance
    const userid = renewal.createdBy
    const session = client.startSession()
    await session
      .withTransaction(async () => {
        const account = await db
          .collection<Account>('Account')
          .findOne({ createdBy: userid }, { session })

        // if account balance is not enough, delete the subscription & renewal order
        if (account?.balance < renewal.amount) {
          await db
            .collection<SubscriptionRenewal>('SubscriptionRenewal')
            .deleteOne({ _id: renewal._id }, { session })

          await db
            .collection<Subscription>('Subscription')
            .deleteOne(
              { _id: new ObjectId(renewal.subscriptionId) },
              { session },
            )
          return
        }

        // Pay the subscription renewal order from account balance
        const priceAmount = renewal.amount
        if (priceAmount !== 0) {
          await db.collection<Account>('Account').updateOne(
            {
              _id: account._id,
              balance: { $gte: priceAmount },
            },
            { $inc: { balance: -priceAmount } },
            { session },
          )
        }

        // Create account transaction
        await db.collection('AccountTransaction').insertOne({
          accountId: account._id,
          amount: -priceAmount,
          balance: account.balance - priceAmount,
          message: `subscription renewal order ${renewal._id}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        // Update subscription 'expiredAt' time
        await db.collection<Subscription>('Subscription').updateOne(
          { _id: new ObjectId(renewal.subscriptionId) },
          [
            {
              $set: {
                expiredAt: { $add: ['$expiredAt', renewal.duration * 1000] },
              },
            },
          ],
          { session },
        )

        // Update subscription renewal order phase to ‘Paid’
        await db
          .collection<SubscriptionRenewal>('SubscriptionRenewal')
          .updateOne(
            { _id: renewal._id },
            {
              $set: {
                phase: SubscriptionRenewalPhase.Paid,
                lockedAt: TASK_LOCK_INIT_TIME,
              },
            },
            { session },
          )
      })
      .catch((err) => {
        this.logger.debug(renewal._id, err.toString())
      })
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingTimeout() {
    const timeout = 30 * 60 * 1000

    const db = SystemDatabase.db
    await db.collection<SubscriptionRenewal>('SubscriptionRenewal').updateMany(
      {
        phase: SubscriptionRenewalPhase.Pending,
        lockedAt: { $lte: new Date(Date.now() - this.lockTimeout * 1000) },
        createdAt: { $lte: new Date(Date.now() - timeout) },
      },
      {
        $set: {
          phase: SubscriptionRenewalPhase.Failed,
          message: `Timeout exceeded ${timeout / 1000} seconds`,
        },
      },
    )
  }

  /**
   * Unlock subscription
   */
  async unlock(id: ObjectId) {
    const db = SystemDatabase.db
    await db
      .collection<SubscriptionRenewal>('SubscriptionRenewal')
      .updateOne({ _id: id }, { $set: { lockedAt: TASK_LOCK_INIT_TIME } })
  }
}
