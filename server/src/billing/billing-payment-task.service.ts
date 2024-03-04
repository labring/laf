import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationState,
} from 'src/application/entities/application'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  ApplicationBilling,
  ApplicationBillingState,
} from './entities/application-billing'
import * as assert from 'assert'
import { Account } from 'src/account/entities/account'
import { AccountTransaction } from 'src/account/entities/account-transaction'
import Decimal from 'decimal.js'
import { NotificationService } from 'src/notification/notification.service'
import { NotificationType } from 'src/notification/notification-type'

@Injectable()
export class BillingPaymentTaskService {
  private readonly logger = new Logger(BillingPaymentTaskService.name)
  private readonly lockTimeout = 60 * 60 // in second
  private lastTick = TASK_LOCK_INIT_TIME

  constructor(private readonly notificationService: NotificationService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async tick() {
    if (ServerConfig.DISABLED_BILLING_PAYMENT_TASK) {
      this.logger.warn('Skip billing payment task due to config')
      return
    }

    // If last tick is less than 1 minute ago, return
    if (Date.now() - this.lastTick.getTime() < 1000 * 60) {
      this.logger.debug(
        `Skip billing payment task due to last tick time ${this.lastTick.toISOString()}}`,
      )
      return
    }

    this.logger.debug('Start handling pending application billing')
    this.handlePendingApplicationBilling().catch((err) => {
      this.logger.error(
        'Error occurred while handling pending application billing',
        err,
      )
    })
  }

  private async handlePendingApplicationBilling() {
    this.lastTick = new Date()

    const db = SystemDatabase.db
    const res = await db
      .collection<ApplicationBilling>('ApplicationBilling')
      .findOneAndUpdate(
        {
          state: ApplicationBillingState.Pending,
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        { $set: { lockedAt: new Date() } },
      )

    if (!res.value) {
      this.logger.debug('No pending application billing found')
      return
    }

    const billing = res.value

    // pay billing
    const session = SystemDatabase.client.startSession()

    try {
      await session.withTransaction(async () => {
        // get account
        const account = await db
          .collection<Account>('Account')
          .findOne({ createdBy: billing.createdBy }, { session })

        assert(account, `Account ${billing.createdBy} not found`)

        // update the account balance
        const amount = new Decimal(billing.amount).mul(100).toNumber()

        const updated = await db
          .collection<Account>('Account')
          .updateOne(
            { _id: account._id },
            { $inc: { balance: -amount }, $set: { updatedAt: new Date() } },
            { session },
          )

        assert(updated.modifiedCount, `Account ${account._id} not found`)

        const newBalance = account.balance - amount

        // create transaction
        await db.collection<AccountTransaction>('AccountTransaction').insertOne(
          {
            accountId: account._id,
            amount: -amount,
            balance: newBalance,
            message: `Application ${billing.appid} billing`,
            billingId: billing._id,
            createdAt: new Date(),
          },
          { session },
        )

        // update billing state
        await db
          .collection<ApplicationBilling>('ApplicationBilling')
          .updateOne(
            { _id: billing._id },
            { $set: { state: ApplicationBillingState.Done } },
            { session },
          )

        this.logger.log(
          `Billing payment done for application ${
            billing.appid
          } from ${billing.startAt?.toISOString()} to ${billing.endAt?.toISOString()} for billing ${
            billing._id
          }`,
        )

        // stop application if balance is not enough
        if (newBalance < 0) {
          // if owed, add an owe flag
          if (!account.owedAt) {
            await db.collection<Account>('Account').updateOne(
              {
                _id: account._id,
              },
              {
                $set: {
                  owedAt: new Date(),
                },
              },
              { session },
            )
          }

          const res = await db.collection<Application>('Application').updateOne(
            { appid: billing.appid, state: ApplicationState.Running },
            {
              $set: {
                state: ApplicationState.Stopped,
                forceStoppedAt: new Date(),
              },
            },
            { session },
          )

          if (res.modifiedCount > 0) {
            this.logger.warn(
              `Application ${billing.appid} stopped due to insufficient balance`,
            )

            this.notificationService.notify({
              type: NotificationType.InsufficientBalance,
              uid: account.createdBy,
              payload: {
                appid: billing.appid,
              },
            })
          }
        }
      })
    } catch (error) {
      this.logger.error(
        'Error occurred while handling pending application billing',
        error,
        error.stack,
      )
    } finally {
      await session.endSession()
      this.handlePendingApplicationBilling()
    }
  }
}
