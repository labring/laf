import { Injectable, Logger } from '@nestjs/common'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { CreateTriggerDto } from './dto/create-trigger.dto'
import CronValidate from 'cron-validate'
import { SystemDatabase } from 'src/system-database'
import {
  CronTrigger,
  TriggerPhase,
  TriggerState,
} from './entities/cron-trigger'
import { ClientSession, ObjectId } from 'mongodb'

@Injectable()
export class TriggerService {
  private readonly logger = new Logger(TriggerService.name)
  private readonly db = SystemDatabase.db

  async create(appid: string, dto: CreateTriggerDto) {
    const { desc, cron, target } = dto
    const res = await this.db.collection<CronTrigger>('CronTrigger').insertOne({
      appid,
      desc,
      cron,
      target,
      state: TriggerState.Active,
      phase: TriggerPhase.Creating,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return this.findOne(appid, res.insertedId)
  }

  async count(appid: string) {
    const count = await this.db
      .collection<CronTrigger>('CronTrigger')
      .countDocuments({ appid })

    return count
  }

  async findOne(appid: string, id: ObjectId) {
    const doc = await this.db
      .collection<CronTrigger>('CronTrigger')
      .findOne({ appid, _id: id })

    return doc
  }

  async findAll(appid: string) {
    const docs = await this.db
      .collection<CronTrigger>('CronTrigger')
      .find({ appid, state: TriggerState.Active })
      .toArray()

    return docs
  }

  async removeOne(appid: string, id: ObjectId) {
    await this.db
      .collection<CronTrigger>('CronTrigger')
      .updateOne({ appid, _id: id }, { $set: { state: TriggerState.Deleted } })

    return this.findOne(appid, id)
  }

  async removeAll(appid: string) {
    const res = await this.db
      .collection<CronTrigger>('CronTrigger')
      .updateMany({ appid }, { $set: { state: TriggerState.Deleted } })

    return res
  }

  async findAllByTarget(appid: string, target: string) {
    const docs = await this.db
      .collection<CronTrigger>('CronTrigger')
      .find({ appid, target })
      .toArray()
    return docs
  }

  async createMany(docs: CronTrigger[], session?: ClientSession) {
    if (session) {
      const result = await this.db
        .collection<CronTrigger>('CronTrigger')
        .insertMany(docs, { session })
      return result
    }
    const result = await this.db
      .collection<CronTrigger>('CronTrigger')
      .insertMany(docs)
    return result
  }

  async removeAllByTarget(
    appid: string,
    target: string,
    session?: ClientSession,
  ) {
    if (session) {
      const res = await this.db
        .collection<CronTrigger>('CronTrigger')
        .updateMany(
          { appid, target },
          { $set: { state: TriggerState.Deleted } },
          { session },
        )
      return res
    }
    const res = await this.db
      .collection<CronTrigger>('CronTrigger')
      .updateMany({ appid, target }, { $set: { state: TriggerState.Deleted } })

    return res
  }

  isValidCronExpression(cron: string) {
    const ret = CronValidate(cron)
    if (ret.isValid()) {
      return true
    }

    return false
  }
}
