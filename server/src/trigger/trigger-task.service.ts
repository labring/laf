import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { times } from 'lodash'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'
import { CronJobService } from './cron-job.service'
import { CronTrigger, TriggerPhase, TriggerState } from '@prisma/client'
import * as assert from 'node:assert'

@Injectable()
export class TriggerTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(TriggerTaskService.name)

  constructor(private readonly cronService: CronJobService) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    // Phase `Creating` -> `Created`
    times(this.concurrency, () => this.handleCreatingPhase())

    // Phase `Deleting` -> `Deleted`
    times(this.concurrency, () => this.handleDeletingPhase())

    // Phase `Created` -> `Deleting`
    this.handleInactiveState()

    // Phase `Deleted` -> `Creating`
    this.handleActiveState()

    // Phase `Deleting` -> `Deleted`
    this.handleDeletedState()

    // Clear timeout locks
    this.clearTimeoutLocks()
  }

  /**
   * Phase `Creating`:
   * - create cron job of trigger
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<CronTrigger>('CronTrigger')
      .findOneAndUpdate(
        {
          phase: TriggerPhase.Creating,
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )
    if (!res.value) return

    // fix id for prisma type
    const doc = {
      ...res.value,
      id: res.value._id.toString(),
    }

    // create cron job
    const job = await this.cronService.create(doc)
    if (!job) return

    this.logger.debug('cron job created: ' + doc._id)

    // update phase to `Created`
    const updated = await db.collection<CronTrigger>('CronTrigger').updateOne(
      {
        _id: doc._id,
        phase: TriggerPhase.Creating,
      },
      {
        $set: {
          phase: TriggerPhase.Created,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('trigger phase updated to Created ', doc._id)
  }

  /**
   * Phase `Deleting`:
   * - delete cron job of trigger
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<CronTrigger>('CronTrigger')
      .findOneAndUpdate(
        {
          phase: TriggerPhase.Deleting,
          lockedAt: {
            $lt: new Date(Date.now() - 1000 * this.lockTimeout),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )
    if (!res.value) return

    // fix id for prisma type
    const doc = {
      ...res.value,
      id: res.value._id.toString(),
    }

    // delete cron job
    const ret = await this.cronService.delete(doc)
    if (ret?.status !== 'Success') return

    this.logger.debug('cron job deleted:', doc._id)

    // update phase to `Deleted`
    const updated = await db.collection<CronTrigger>('CronTrigger').updateOne(
      {
        _id: doc._id,
        phase: TriggerPhase.Deleting,
      },
      {
        $set: {
          phase: TriggerPhase.Deleted,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('cron trigger phase updated to Deleted ' + doc._id)
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<CronTrigger>('CronTrigger').updateMany(
      {
        state: TriggerState.Active,
        phase: TriggerPhase.Deleted,
      },
      {
        $set: {
          phase: TriggerPhase.Creating,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * State `Inactive`:
   * - move `Created` to `Deleting`
   */
  async handleInactiveState() {
    const db = SystemDatabase.db

    await db.collection<CronTrigger>('CronTrigger').updateMany(
      {
        state: TriggerState.Inactive,
        phase: TriggerPhase.Created,
      },
      {
        $set: {
          phase: TriggerPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * State `Deleted`:
   * - move `Created` to `Deleting`
   * - delete `Deleted` documents
   */
  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<CronTrigger>('CronTrigger').updateMany(
      {
        state: TriggerState.Deleted,
        phase: TriggerPhase.Created,
      },
      {
        $set: {
          phase: TriggerPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<CronTrigger>('CronTrigger').deleteMany({
      state: TriggerState.Deleted,
      phase: TriggerPhase.Deleted,
    })
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const db = SystemDatabase.db

    await db.collection<CronTrigger>('CronTrigger').updateMany(
      {
        lockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      {
        $set: {
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }
}
