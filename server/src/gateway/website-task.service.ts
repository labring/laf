import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DomainPhase, DomainState, WebsiteHosting } from '@prisma/client'
import { times } from 'lodash'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/database/system-database'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 1 // concurrency count
  private readonly logger = new Logger(WebsiteTaskService.name)

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    return
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
   * - create website route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const doc = await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .findOneAndUpdate(
        {
          phase: DomainPhase.Creating,
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

    if (doc.value) {
      // TODO
      // create website route
      // update phase to `Created`
    }
  }

  /**
   * Phase `Deleting`:
   * - delete website route
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const doc = await db
      .collection<WebsiteHosting>('WebsiteHosting')
      .findOneAndUpdate(
        {
          phase: DomainPhase.Deleting,
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

    if (doc.value) {
      // TODO
      // delete website route
      // update phase to `Deleted`
    }
  }

  /**
   * State `Inactive`:
   * - move phase `Created` to `Deleting`
   */
  async handleInactiveState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Inactive,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Active,
        phase: DomainPhase.Deleted,
      },
      {
        $set: {
          phase: DomainPhase.Creating,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )
  }

  /**
   * State `Deleted`:
   * - move phase `Created` to `Deleting`
   * - delete `Deleted` documents
   */
  async handleDeletedState() {
    const db = SystemDatabase.db

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Deleted,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: TASK_LOCK_INIT_TIME,
        },
      },
    )

    await db.collection<WebsiteHosting>('WebsiteHosting').deleteMany({
      state: DomainState.Deleted,
      phase: DomainPhase.Deleted,
    })
  }

  /**
   * Clear timeout locks
   */
  async clearTimeoutLocks() {
    const db = SystemDatabase.db
    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
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
