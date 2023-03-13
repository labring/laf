import { Application, Subscription, SubscriptionPhase } from '.prisma/client'
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import * as assert from 'node:assert'
import { ApplicationService } from 'src/application/application.service'
import { ApplicationState, SubscriptionState } from '@prisma/client'
import { ObjectId } from 'mongodb'
import { BundleService } from 'src/region/bundle.service'
import { CreateSubscriptionDto } from './dto/create-subscription.dto'

@Injectable()
export class SubscriptionTaskService {
  readonly lockTimeout = 30 // in second

  private readonly logger = new Logger(SubscriptionTaskService.name)

  constructor(
    private readonly bundleService: BundleService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_SUBSCRIPTION_TASK) {
      return
    }

    // Phase `Pending` -> `Valid`
    this.handlePendingPhaseAndNotExpired()

    // Phase `Valid` -> `Expired`
    this.handleValidPhaseAndExpired()

    // Phase `Expired` -> `ExpiredAndStopped`
    this.handleExpiredPhase()

    // Phase `ExpiredAndStopped` -> `Valid`
    this.handleExpiredAndStoppedPhaseAndNotExpired()

    // Phase `ExpiredAndStopped` -> `Deleted`
    this.handleExpiredAndStoppedPhase()

    // State `Deleted`
    this.handleDeletedState()
  }

  /**
   * Phase `Pending` and not expired:
   * - if appid is null, generate appid
   * - if appid exists, but application is not found
   *   - create application
   * - update subscription phase to `Valid`
   */
  async handlePendingPhaseAndNotExpired() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Subscription>('Subscription')
      .findOneAndUpdate(
        {
          phase: SubscriptionPhase.Pending,
          expiredAt: { $gt: new Date() },
          lockedAt: { $lt: new Date(Date.now() - this.lockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value

    // if application not found, create application
    const application = await this.applicationService.findOne(doc.appid)
    if (!application) {
      const userid = doc.createdBy.toString()
      const dto = new CreateSubscriptionDto()
      dto.name = doc.input.name
      dto.regionId = doc.input.regionId
      dto.state = doc.input.state as ApplicationState
      dto.runtimeId = doc.input.runtimeId
      dto.bundleId = doc.bundleId

      await this.applicationService.create(userid, doc.appid, dto)
      return await this.unlock(doc._id)
    }

    // update subscription phase to `Valid`
    await db.collection<Subscription>('Subscription').updateOne(
      { _id: doc._id },
      {
        $set: { phase: SubscriptionPhase.Valid, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )
  }

  /**
   * Phase ‘Valid’ with expiredAt < now
   * - update subscription phase to ‘Expired’
   */
  async handleValidPhaseAndExpired() {
    const db = SystemDatabase.db

    await db.collection<Subscription>('Subscription').updateMany(
      {
        phase: SubscriptionPhase.Valid,
        expiredAt: { $lt: new Date() },
      },
      { $set: { phase: SubscriptionPhase.Expired } },
    )
  }

  /**
   * Phase 'Expired':
   * - update application state to 'Stopped'
   * - update subscription phase to 'ExpiredAndStopped'
   */
  async handleExpiredPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Subscription>('Subscription')
      .findOneAndUpdate(
        {
          phase: SubscriptionPhase.Expired,
          lockedAt: { $lt: new Date(Date.now() - this.lockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    const doc = res.value

    // update application state to 'Stopped'
    await db
      .collection<Application>('Application')
      .updateOne(
        { appid: doc.appid },
        { $set: { state: ApplicationState.Stopped } },
      )

    // update subscription phase to 'ExpiredAndStopped'
    await db.collection<Subscription>('Subscription').updateOne(
      { _id: doc._id },
      {
        $set: {
          phase: SubscriptionPhase.ExpiredAndStopped,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * Phase 'ExpiredAndStopped' but not expired (renewal case):
   * - update subscription phase to ‘Valid’
   * (TODO) update application state to ‘Running’
   */
  async handleExpiredAndStoppedPhaseAndNotExpired() {
    const db = SystemDatabase.db

    await db.collection<Subscription>('Subscription').updateMany(
      {
        phase: SubscriptionPhase.ExpiredAndStopped,
        expiredAt: { $gt: new Date() },
      },
      { $set: { phase: SubscriptionPhase.Valid } },
    )
  }

  /**
   * Phase 'ExpiredAndStopped':
   * -if ‘Bundle.reservedTimeAfterExpired’ expired
   *   1. Update application state to ‘Deleted’
   *   2. Update subscription phase to ‘ExpiredAndDeleted’
   */
  async handleExpiredAndStoppedPhase() {
    const db = SystemDatabase.db

    const specialLockTimeout = 60 * 60 // 1 hour

    const res = await db
      .collection<Subscription>('Subscription')
      .findOneAndUpdate(
        {
          phase: SubscriptionPhase.ExpiredAndStopped,
          lockedAt: { $lt: new Date(Date.now() - specialLockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    const doc = res.value

    // if ‘Bundle.reservedTimeAfterExpired’ expired
    const bundle = await this.bundleService.findApplicationBundle(doc.appid)
    assert(bundle, 'bundle not found')

    const reservedTimeAfterExpired =
      bundle.resource.reservedTimeAfterExpired * 1000
    const expiredTime = Date.now() - doc.expiredAt.getTime()
    if (expiredTime < reservedTimeAfterExpired) {
      return // return directly without unlocking it!
    }

    // 2. Update subscription state to 'Deleted'
    await db.collection<Subscription>('Subscription').updateOne(
      { _id: doc._id },
      {
        $set: {
          state: SubscriptionState.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * State `Deleted`
   */
  async handleDeletedState() {
    const db = SystemDatabase.db
    const res = await db
      .collection<Subscription>('Subscription')
      .findOneAndUpdate(
        {
          state: SubscriptionState.Deleted,
          lockedAt: { $lt: new Date(Date.now() - this.lockTimeout * 1000) },
        },
        { $set: { lockedAt: new Date() } },
      )
    if (!res.value) return

    const doc = res.value

    // Update application state to ‘Deleted’
    await this.applicationService.remove(doc.appid)

    // Update subscription phase to 'Deleted'
    await db.collection<Subscription>('Subscription').updateOne(
      { _id: doc._id },
      {
        $set: {
          phase: SubscriptionPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingTimeout() {
    const timeout = 30 * 60 * 1000

    const db = SystemDatabase.db
    await db.collection<Subscription>('Subscription').deleteMany({
      phase: SubscriptionPhase.Pending,
      lockedAt: { $lte: new Date(Date.now() - this.lockTimeout * 1000) },
      createdAt: { $lte: new Date(Date.now() - timeout) },
    })
  }

  /**
   * Unlock subscription
   */
  async unlock(id: ObjectId) {
    const db = SystemDatabase.db
    await db
      .collection<Subscription>('Subscription')
      .updateOne({ _id: id }, { $set: { lockedAt: TASK_LOCK_INIT_TIME } })
  }
}
