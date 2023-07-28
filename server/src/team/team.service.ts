import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { SystemDatabase } from 'src/system-database'
import { Team } from './entities/team'
import { ClientSession, ObjectId } from 'mongodb'
import { TeamMemberService } from './team-member/team-member.service'
import { TeamRole } from './entities/team-member'

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name)
  private readonly db = SystemDatabase.db

  constructor(
    @Inject(forwardRef(() => TeamMemberService))
    private readonly memberService: TeamMemberService,
  ) {}

  async findAll(createdBy: ObjectId) {
    const res = await this.db
      .collection<Team>('Team')
      .find({
        createdBy,
      })
      .toArray()
    return res
  }

  async update(teamId: ObjectId, dto: Partial<Team>) {
    const res = await this.db.collection<Team>('Team').findOneAndUpdate(
      { _id: teamId },
      {
        $set: {
          ...dto,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    )
    return res.value
  }

  async findOne(teamId: ObjectId, session?: ClientSession) {
    const res = await this.db
      .collection<Team>('Team')
      .findOne({ _id: teamId }, { session })
    return res
  }

  async create(name: string, createdBy: ObjectId, defaultTeam = false) {
    const session = SystemDatabase.client.startSession()
    try {
      let team: Team
      await session.withTransaction(async () => {
        const res = await this.db.collection<Team>('Team').insertOne(
          {
            name: name,
            createdBy: createdBy,
            default: defaultTeam,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            session,
          },
        )

        await this.memberService.addOne(
          res.insertedId,
          createdBy,
          session,
          TeamRole.Owner,
        )
        team = await this.findOne(res.insertedId, session)
      })

      return team
    } finally {
      await session.endSession()
    }
  }

  async delete(teamId: ObjectId, session?: ClientSession) {
    let needEndSession = false
    if (!session) {
      session = SystemDatabase.client.startSession()
      needEndSession = true
    }
    const team = await this.findOne(teamId, session)

    try {
      session.startTransaction()
      // delete team
      const res = await this.db
        .collection<Team>('Team')
        .deleteOne({ _id: teamId }, { session })

      // delete team members
      await this.memberService.removeAll(teamId, session)
      const ok = res.acknowledged && res.deletedCount > 0

      await session.commitTransaction()

      return [ok, team]
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      if (needEndSession) {
        await session.endSession()
      }
    }
  }
}
