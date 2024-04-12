import { Injectable, Logger } from '@nestjs/common'
import { RegionService } from 'src/region/region.service'
import * as assert from 'node:assert'
import { Cron, CronExpression } from '@nestjs/schedule'
import { ServerConfig, TASK_LOCK_INIT_TIME } from 'src/constants'
import { SystemDatabase } from 'src/system-database'
import { MinioService } from './minio/minio.service'
import {
  StoragePhase,
  StorageState,
  StorageUser,
} from './entities/storage-user'

@Injectable()
export class StorageUserTaskService {
  readonly lockTimeout = 30 // in second
  private readonly logger = new Logger(StorageUserTaskService.name)

  constructor(
    private readonly minioService: MinioService,
    private readonly regionService: RegionService,
  ) {}

  @Cron(CronExpression.EVERY_SECOND)
  async tick() {
    if (ServerConfig.DISABLED_STORAGE_USER_TASK) {
      return
    }

    // Phase `Creating` -> `Created`
    this.handleCreatingPhase().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleting` -> `Deleted`
    this.handleDeletingPhase().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Created` -> `Deleting`
    this.handleInactiveState().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleted` -> `Creating`
    this.handleActiveState().catch((err) => {
      this.logger.error(err)
    })

    // Phase `Deleting` -> `Deleted`
    this.handleDeletedState().catch((err) => {
      this.logger.error(err)
    })
  }

  /**
   * Phase `Creating`:
   * - create bucket
   * - move phase `Creating` to `Created`
   */
  async handleCreatingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<StorageUser>('StorageUser')
      .findOneAndUpdate(
        {
          phase: StoragePhase.Creating,
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
        { returnDocument: 'after' },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value
    const region = await this.regionService.findByAppId(doc.appid)
    assert(region, 'region not found')

    const accessKey = doc.appid
    const secretKey = doc.secretKey

    const minioUser = await this.minioService.getUser(region, accessKey)
    if (!minioUser) {
      const res = await this.minioService.createUser(
        region,
        accessKey,
        secretKey,
      )
      if (res.error) {
        this.logger.error('create storage user failed: ', res.error)
        return
      }
    }
    // add storage user to common user group in minio
    const result = await this.minioService.addUserToGroup(region, accessKey)
    if (result?.error) {
      this.logger.error('add storage user to group failed: ', result.error)
      return
    }

    // update phase to `Created`
    const updated = await db.collection<StorageUser>('StorageUser').updateOne(
      { _id: doc._id, phase: StoragePhase.Creating },
      {
        $set: { phase: StoragePhase.Created, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('storage-user phase updated to Created: ', doc)
  }

  /**
   * Phase `Deleting`:
   * - delete bucket
   * - move phase `Deleting` to `Deleted`
   */
  async handleDeletingPhase() {
    const db = SystemDatabase.db

    const res = await db
      .collection<StorageUser>('StorageUser')
      .findOneAndUpdate(
        {
          phase: StoragePhase.Deleting,
          lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
        },
        { $set: { lockedAt: new Date() } },
        { returnDocument: 'after' },
      )
    if (!res.value) return

    // get region by appid
    const doc = res.value
    const appid = doc.appid
    const region = await this.regionService.findByAppId(appid)
    assert(region, 'region not found')

    // delete user in minio
    const result = await this.minioService.deleteUser(region, appid)
    if (result.error) {
      this.logger.error('delete user failed: ', result.error)
      return
    }

    // update phase to `Deleted`
    const updated = await db.collection<StorageUser>('StorageUser').updateOne(
      { _id: doc._id, phase: StoragePhase.Deleting },
      {
        $set: { phase: StoragePhase.Deleted, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    if (updated.modifiedCount > 0)
      this.logger.debug('storage-user phase updated to Deleted: ', doc)
  }

  /**
   * State `Active`:
   * - move phase `Deleted` to `Creating`
   */
  async handleActiveState() {
    const db = SystemDatabase.db

    await db.collection<StorageUser>('StorageUser').updateMany(
      {
        state: StorageState.Active,
        phase: StoragePhase.Deleted,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: StoragePhase.Creating, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )
  }

  /**
   * State `Inactive`:
   * - move `Created` to `Deleting`
   */
  async handleInactiveState() {
    const db = SystemDatabase.db

    await db.collection<StorageUser>('StorageUser').updateMany(
      {
        state: StorageState.Inactive,
        phase: StoragePhase.Created,
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: StoragePhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
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

    await db.collection<StorageUser>('StorageUser').updateMany(
      {
        state: StorageState.Deleted,
        phase: { $in: [StoragePhase.Created, StoragePhase.Creating] },
        lockedAt: { $lt: new Date(Date.now() - 1000 * this.lockTimeout) },
      },
      {
        $set: { phase: StoragePhase.Deleting, lockedAt: TASK_LOCK_INIT_TIME },
      },
    )

    await db
      .collection<StorageUser>('StorageUser')
      .deleteMany({ state: StorageState.Deleted, phase: StoragePhase.Deleted })
  }
}
