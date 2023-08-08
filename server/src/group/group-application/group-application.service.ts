import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { GroupApplication } from '../entities/group-application'
import { ClientSession, ObjectId } from 'mongodb'

@Injectable()
export class GroupApplicationService {
  private readonly db = SystemDatabase.db

  async find(groupId: ObjectId) {
    const res = await this.db
      .collection<GroupApplication>('GroupApplication')
      .aggregate()
      .match({
        groupId,
      })
      .lookup({
        from: 'Application',
        localField: 'appid',
        foreignField: 'appid',
        as: 'application',
      })
      .unwind('$application')
      .project({
        _id: 0,
        appid: '$application.appid',
        name: '$application.name',
      })
      .toArray()

    return res
  }

  async findOne(groupId: ObjectId, appid: string) {
    const res = await this.db
      .collection<GroupApplication>('GroupApplication')
      .aggregate()
      .match({
        groupId,
        appid,
      })
      .lookup({
        from: 'Application',
        localField: 'appid',
        foreignField: 'appid',
        as: 'application',
      })
      .unwind('$application')
      .project({
        _id: 0,
        appid: '$application.appid',
        name: '$application.name',
      })
      .next()

    return res
  }

  async append(groupId: ObjectId, appid: string, session?: ClientSession) {
    const res = await this.db
      .collection<GroupApplication>('GroupApplication')
      .insertOne(
        {
          appid,
          groupId,
          createdAt: new Date(),
        },
        { session },
      )

    const app = await this.db
      .collection<GroupApplication>('GroupApplication')
      .findOne(
        {
          _id: res.insertedId,
        },
        { session },
      )

    return app
  }

  async remove(groupId: ObjectId, appid: string) {
    const res = await this.db
      .collection<GroupApplication>('GroupApplication')
      .deleteOne({
        groupId,
        appid,
      })

    return res
  }

  async removeAll(groupId: ObjectId, session: ClientSession) {
    const res = await this.db
      .collection<GroupApplication>('GroupApplication')
      .deleteMany(
        {
          groupId,
        },
        { session },
      )

    return res
  }
}
