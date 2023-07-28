import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { TeamApplication } from '../entities/team-application'
import { ObjectId } from 'mongodb'

@Injectable()
export class TeamApplicationService {
  private readonly db = SystemDatabase.db

  async find(teamId: string) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .aggregate([
        {
          $match: {
            teamId,
          },
        },
        {
          $lookup: {
            from: 'Application',
            localField: 'appid',
            foreignField: 'appid',
            as: 'application',
          },
        },
      ])
      .toArray()

    return res
  }

  async append(teamId: ObjectId, appid: string) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .insertOne({
        appid,
        teamId,
        createdAt: new Date(),
      })

    const app = await this.db
      .collection<TeamApplication>('TeamApplication')
      .findOne({
        _id: res.insertedId,
      })

    return app
  }

  async remove(teamId: ObjectId, appid: string) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .deleteOne({
        teamId,
        appid,
      })

    return res.deletedCount > 0
  }
}
