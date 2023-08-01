import { Injectable, Logger } from '@nestjs/common'

import { SystemDatabase } from 'src/system-database'
import { Team } from '../entities/team'
import { ClientSession, ObjectId } from 'mongodb'
import { TeamMember, TeamRole } from '../entities/team-member'
import { TeamInviteCode } from '../entities/team-invite-code'
import { ApplicationService } from 'src/application/application.service'

@Injectable()
export class TeamInviteService {
  private readonly logger = new Logger(TeamInviteService.name)
  private readonly db = SystemDatabase.db

  constructor(private readonly applicationService: ApplicationService) {}

  async updateMemberRole(teamId: ObjectId, uid: ObjectId, role: TeamRole) {
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
    return res
  }

  async findMember(teamId: ObjectId, uid: ObjectId) {
    const res = await this.db.collection<TeamMember>('TeamMember').findOne({
      teamId,
      uid,
    })
    return res
  }

  async findMembers(teamId: ObjectId) {
    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .find({ teamId })
      .toArray()

    return res
  }

  async addMember(teamId: ObjectId, uid: ObjectId) {
    await this.db.collection<TeamMember>('TeamMember').insertOne({
      teamId,
      uid,
      role: TeamRole.Developer,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return await this.findMember(teamId, uid)
  }

  async removeMember(teamId: ObjectId, uid: ObjectId) {
    const res = await this.db.collection<TeamMember>('TeamMember').deleteOne({
      teamId,
      uid,
    })
    const ok = res.acknowledged && res.deletedCount > 0
    return [ok, res]
  }

  async getInviteCode(teamId: ObjectId) {
    let res = await this.db
      .collection<TeamInviteCode>('TeamInviteCode')
      .findOne({ teamId: teamId })
    if (!res) {
      const code = new ObjectId().toString()

      const data = await this.db
        .collection<TeamInviteCode>('TeamInviteCode')
        .insertOne({
          teamId,
          code,
          enable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

      res = await this.db
        .collection<TeamInviteCode>('TeamInviteCode')
        .findOne({ _id: data.insertedId })
    }
    return res
  }

  async findOneByCode(code: string) {
    const res = await this.db
      .collection<TeamInviteCode>('TeamInviteCode')
      .findOne({
        code,
      })
    return res
  }

  async updateInviteCode(teamId: ObjectId, dto: Partial<TeamInviteCode>) {
    const res = await this.db
      .collection<TeamInviteCode>('TeamInviteCode')
      .findOneAndUpdate(
        { teamId },
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

  async resetInviteCode(teamId: ObjectId) {
    await this.db
      .collection<TeamInviteCode>('TeamInviteCode')
      .deleteOne({ teamId })

    return await this.getInviteCode(teamId)
  }

  async deleteInviteCode(teamId: ObjectId, session?: ClientSession) {
    const res = await this.db
      .collection<TeamInviteCode>('TeamInviteCode')
      .deleteMany({ teamId }, { session })
    return res
  }
}
