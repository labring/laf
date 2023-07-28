import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { SystemDatabase } from 'src/system-database'
import { ClientSession, ObjectId } from 'mongodb'
import { TeamMember, TeamRole } from '../entities/team-member'
import { ApplicationService } from 'src/application/application.service'
import { TeamService } from '../team.service'

@Injectable()
export class TeamMemberService {
  private readonly logger = new Logger(TeamMemberService.name)
  private readonly db = SystemDatabase.db

  constructor(
    private readonly applicationService: ApplicationService,
    @Inject(forwardRef(() => TeamService))
    private readonly teamService: TeamService,
  ) {}

  async updateRole(teamId: ObjectId, uid: ObjectId, role: TeamRole) {
    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .findOneAndUpdate(
        { teamId, uid },
        {
          $set: {
            role,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' },
      )
    return res
  }

  async findOne(teamId: ObjectId, uid: ObjectId, session?: ClientSession) {
    const res = await this.db.collection<TeamMember>('TeamMember').findOne(
      {
        teamId,
        uid,
      },
      {
        session,
      },
    )
    return res
  }

  async find(teamId: ObjectId) {
    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .find({ teamId })
      .toArray()

    return res
  }

  async addOne(
    teamId: ObjectId,
    uid: ObjectId,
    session?: ClientSession,
    role: TeamRole = TeamRole.Developer,
  ) {
    await this.db.collection<TeamMember>('TeamMember').insertOne(
      {
        teamId,
        uid,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        session,
      },
    )
    return await this.findOne(teamId, uid, session)
  }

  async removeOne(teamId: ObjectId, uid: ObjectId) {
    const res = await this.db.collection<TeamMember>('TeamMember').deleteOne({
      teamId,
      uid,
    })
    const ok = res.acknowledged && res.deletedCount > 0
    return [ok, res]
  }

  async removeAll(teamId: ObjectId, session?: ClientSession) {
    const res = await this.db.collection<TeamMember>('TeamMember').deleteMany(
      {
        teamId,
      },
      { session },
    )
    const ok = res.acknowledged && res.deletedCount > 0
    return [ok, res]
  }

  async leaveTeam(teamId: ObjectId, uid: ObjectId) {
    const member = await this.findOne(teamId, uid)
    if (member.role === TeamRole.Owner) {
      return [false, 'Owner cannot leave team']
    }

    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .deleteOne({ teamId, uid })

    const ok = res.acknowledged && res.deletedCount > 0
    if (!ok) {
      return [false, 'leave team failed']
    }

    return [ok, member]
  }
}
