import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common'

import { SystemDatabase } from 'src/system-database'
import { Team } from './entities/team'
import { ClientSession, ObjectId } from 'mongodb'
import { TeamMemberService } from './team-member/team-member.service'
import { TeamMember, TeamRole } from './entities/team-member'
import { TeamApplication } from './entities/team-application'
import { TeamInviteService } from './team-invite/team-invite.service'
import { TeamApplicationService } from './team-application/team-application.service'

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name)
  private readonly db = SystemDatabase.db

  constructor(
    @Inject(forwardRef(() => TeamMemberService))
    private readonly memberService: TeamMemberService,
    private readonly inviteService: TeamInviteService,
    private readonly teamApplicationService: TeamApplicationService,
  ) {}

  async findTeamByAppid(appid: string) {
    const res = await this.db.collection<Team>('Team').findOne({ appid })
    return res
  }

  async findAll(uid: ObjectId) {
    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .aggregate()
      .match({ uid })
      .lookup({
        from: 'Team',
        let: { teamId: '$teamId', appid: '$appid' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$teamId', '$$teamId'] },
                  { $exists: ['$$appid', false] },
                ],
              },
            },
          },
        ],
        as: 'team',
      })
      .lookup({
        from: 'TeamMember',
        localField: 'teamId',
        foreignField: 'teamId',
        as: 'member',
      })
      .unwind('$member')
      .project({
        _id: '$team._id',
        name: '$team.name',
        createdAt: '$team.createdAt',
        updatedAt: '$team.updatedAt',
        members: [
          {
            _id: '$member._id',
            role: '$member.role',
          },
        ],
      })
      .toArray()
    return res
  }

  async countTeams(uid: ObjectId) {
    const count = await this.db
      .collection<Team>('Team')
      .countDocuments({ createdBy: uid, appid: { $exists: false } })

    return count
  }

  async findTeamsByAppidAndUid(appid: string, uid: ObjectId) {
    const res = await this.db
      .collection<TeamApplication>('TeamApplication')
      .aggregate()
      .match({ appid })
      .lookup({
        from: 'Team',
        let: { teamId: '$teamId', appid: '$appid' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$teamId', '$$teamId'] },
                  { $exists: ['$$appid', false] },
                ],
              },
            },
          },
        ],
        as: 'team',
      })
      .lookup({
        from: 'TeamMember',
        localField: 'teamId',
        foreignField: 'teamId',
        as: 'member',
      })
      .match({ 'member.uid': uid })
      .project({
        _id: '$team._id',
        name: '$team.name',
        createdAt: '$team.createdAt',
        updatedAt: '$team.updatedAt',
        role: '$member.role',
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

  async findOneWithRole(teamId: ObjectId, uid: ObjectId) {
    const res = await this.db
      .collection<TeamMember>('TeamMember')
      .aggregate()
      .match({ teamId, uid })
      .lookup({
        from: 'Team',
        localField: 'teamId',
        foreignField: '_id',
        as: 'team',
      })
      .project({
        _id: '$team._id',
        name: '$team.name',
        createdAt: '$team.createdAt',
        updatedAt: '$team.updatedAt',
        role: '$role',
      })
      .next()
    return res
  }

  async create(name: string, createdBy: ObjectId, appid?: string) {
    const session = SystemDatabase.client.startSession()
    try {
      let team: Team
      await session.withTransaction(async () => {
        const res = await this.db.collection<Team>('Team').insertOne(
          {
            name,
            appid,
            createdBy: createdBy,
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
          TeamRole.Owner,
          session,
        )

        await this.teamApplicationService.append(res.insertedId, appid, session)

        team = await this.findOne(res.insertedId, session)
      })

      return team
    } catch (err) {
      this.logger.error('create team error', err)
      throw err
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
      await this.db
        .collection<Team>('Team')
        .deleteOne({ _id: teamId }, { session })

      // delete team members
      await this.memberService.removeAll(teamId, session)
      await this.inviteService.deleteManyInviteCode(teamId, session)
      await this.teamApplicationService.removeAll(teamId, session)

      await session.commitTransaction()

      return team
    } catch (err) {
      this.logger.error(`delete team ${teamId} error`, err)
      await session.abortTransaction()
      throw err
    } finally {
      if (needEndSession) {
        await session.endSession()
      }
    }
  }
}
