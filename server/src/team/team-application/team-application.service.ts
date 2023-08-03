import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { TeamApplication } from '../entities/team-application'
import { ClientSession, ObjectId } from 'mongodb'

@Injectable()
export class TeamApplicationService {
  private readonly db = SystemDatabase.db

  async find(teamId: ObjectId) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .aggregate()
      .match({
        teamId,
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

  async findOne(teamId: ObjectId, appid: string) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .findOne({
        teamId,
        appid,
      })

    return res
  }

  async append(teamId: ObjectId, appid: string, session?: ClientSession) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .insertOne(
        {
          appid,
          teamId,
          createdAt: new Date(),
        },
        { session },
      )

    const app = await this.db
      .collection<TeamApplication>('TeamApplication')
      .findOne(
        {
          _id: res.insertedId,
        },
        { session },
      )

    return app
  }

  async remove(teamId: ObjectId, appid: string) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .deleteOne({
        teamId,
        appid,
      })

    return res
  }

  async removeAll(teamId: ObjectId, session: ClientSession) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .deleteMany(
        {
          teamId,
        },
        { session },
      )

    return res
  }
}
