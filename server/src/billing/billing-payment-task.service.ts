import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import {
  Application,
  ApplicationState,
} from 'src/application/entities/application'
import { ServerConfig } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import {
  ApplicationBilling,
  ApplicationBillingState,
} from './entities/application-billing'
import * as assert from 'assert'
import { Account } from 'src/account/entities/account'
import { AccountTransaction } from 'src/account/entities/account-transaction'
import Decimal from 'decimal.js'

@Injectable()
export class BillingPaymentTaskService {
  private readonly logger = new Logger(BillingPaymentTaskService.name)
  private readonly lockTimeout = 5 * 60 // in second

  @Cron(CronExpression.EVERY_30_MINUTES)
  async tick() {
    if (ServerConfig.DISABLED_BILLING_PAYMENT_TASK) {
      return
    }

    this.handlePendingApplicationBilling().catch((err) => {
      this.logger.error(
        'Error occurred while handling pending application billing',
        err,
      )
    })
  }

  private async handlePendingApplicationBilling() {
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

        // TODO: write lock might cause performance issue?
        const updated = await db
          .collection<Account>('Account')
          .updateOne(
            { _id: account._id },
            { $inc: { balance: -amount } },
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

        this.logger.debug(
          `Billing payment done for application ${billing.appid} from ${billing.startAt} to ${billing.endAt}}`,
        )

        // stop application if balance is not enough
        if (newBalance < 0) {
          await db.collection<Application>('Application').updateOne(
            { appid: billing.appid, state: ApplicationState.Running },
            {
              $set: {
                state: ApplicationState.Stopped,
                stoppedAt: new Date(),
              },
            },
            { session },
          )
          this.logger.warn(
            `Application ${billing.appid} stopped due to insufficient balance`,
          )
        }
      })
    } catch (error) {
      this.logger.error(
        'Error occurred while paying billing',
        error,
        error.stack,
      )
    } finally {
      await session.endSession()
    }

    // next tick
    this.handlePendingApplicationBilling().catch((err) => {
      this.logger.error(
        'Error occurred while handling pending application billing',
        err,
        err.stack,
      )
    })
  }
}
