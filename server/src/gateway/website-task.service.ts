import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { DomainPhase, DomainState, WebsiteHosting } from '@prisma/client'
import { MongoService } from 'src/database/mongo.service'
import { times } from 'lodash'

@Injectable()
export class WebsiteTaskService {
  readonly lockTimeout = 30 // in second
  readonly concurrency = 5 // concurrency count
  private readonly logger = new Logger(WebsiteTaskService.name)

  constructor(private readonly mongoService: MongoService) {}

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
   * - create website route
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Inactive,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: null,
        },
      },
    )
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Active,
        phase: DomainPhase.Deleted,
      },
      {
        $set: {
          phase: DomainPhase.Creating,
          lockedAt: null,
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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        state: DomainState.Deleted,
        phase: DomainPhase.Created,
      },
      {
        $set: {
          phase: DomainPhase.Deleting,
          lockedAt: null,
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
    const client = await this.mongoService.getSystemDbClient()
    const db = client.db()

    await db.collection<WebsiteHosting>('WebsiteHosting').updateMany(
      {
        lockedAt: {
          $lt: new Date(Date.now() - 1000 * this.lockTimeout),
        },
      },
      {
        $set: {
          lockedAt: null,
        },
      },
    )
  }
}
