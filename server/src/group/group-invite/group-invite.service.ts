import { Injectable, Logger } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import { ClientSession, ObjectId } from 'mongodb'
import { GroupInviteCode } from '../entities/group-invite-code'
import { FindGroupInviteCodeDto } from '../dto/find-group-invite-code.dto'
import { GenerateGroupInviteCodeDto } from '../dto/update-group-invite-code.dto'
import * as nanoid from 'nanoid'
import { GetGroupInviteCodeDetailDto } from '../dto/get-group-invite-code-detail.dto'
import { GroupMemberService } from '../group-member/group-member.service'
import { User } from 'src/user/entities/user'

@Injectable()
export class GroupInviteService {
  private readonly logger = new Logger(GroupInviteService.name)
  private readonly db = SystemDatabase.db

  constructor(private readonly memberService: GroupMemberService) {}

  async useInviteCode(inviteCode: GroupInviteCode, user: User) {
    const session = SystemDatabase.client.startSession()

    try {
      await session.startTransaction()
      await this.db.collection<GroupInviteCode>('GroupInviteCode').updateOne(
        { _id: inviteCode._id },
        {
          $set: {
            usedBy: user._id,
            updatedAt: new Date(),
          },
        },
        {
          session,
        },
      )

      const res = await this.memberService.addOne(
        inviteCode.groupId,
        user._id,
        inviteCode.role,
        session,
      )

      await session.commitTransaction()
      return res
    } catch (err) {
      this.logger.error(err)
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
  }

  async getInviteCode(groupId: ObjectId) {
    const res = await this.db
      .collection<GroupInviteCode>('GroupInviteCode')
      .aggregate<FindGroupInviteCodeDto>()
      .match({ groupId, usedBy: null })
      // .lookup({
      //   from: 'User',
      //   localField: 'usedBy',
      //   foreignField: '_id',
      //   pipeline: [
      //     {
      //       $project: { username: 1 },
      //     },
      //   ],
      //   as: 'usedBy',
      // })
      // .unwind({
      //   path: '$usedBy',
      //   preserveNullAndEmptyArrays: true,
      // })
      .toArray()

    return res
  }

  async generateInviteCode(groupId: ObjectId, dto: GenerateGroupInviteCodeDto) {
    const code = await this.tryGenerateInviteCode()

    await this.db.collection<GroupInviteCode>('GroupInviteCode').insertOne({
      groupId,
      code,
      role: dto.role,
      createdBy: dto.createdBy,
      usedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return await this.findOneByCode(code)
  }

  async tryGenerateInviteCode() {
    for (let i = 0; i < 10; i++) {
      const code = this.generateInviteCodeInternal()
      const existed = await this.db
        .collection<GroupInviteCode>('GroupInviteCode')
        .findOne({ code })

      if (!existed) return code
    }

    throw new Error('Generate invite code failed')
  }

  private generateInviteCodeInternal(len = 10) {
    const only_alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

    const nano = nanoid.customAlphabet(only_alpha, len)
    return nano()
  }

  async findOneByCode(code: string) {
    const res = await this.db
      .collection<GroupInviteCode>('GroupInviteCode')
      .findOne({ code })
    return res
  }

  async findOneByCodeDetail(code: string) {
    const res = await this.db
      .collection<GroupInviteCode>('GroupInviteCode')
      .aggregate()
      .match({ code })
      .lookup({
        from: 'User',
        localField: 'createdBy',
        foreignField: '_id',
        pipeline: [
          {
            $project: { username: 1 },
          },
        ],
        as: 'invitedBy',
      })
      .unwind('$invitedBy')
      .lookup({
        from: 'Group',
        localField: 'groupId',
        foreignField: '_id',
        pipeline: [
          {
            $project: { name: 1, appid: 1 },
          },
        ],
        as: 'group',
      })
      .unwind('$group')
      .project<GetGroupInviteCodeDetailDto>({
        _id: 0,
        role: 1,
        code: 1,
        usedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        invitedBy: {
          _id: '$invitedBy._id',
          username: '$invitedBy.username',
        },
        group: {
          _id: '$group._id',
          name: '$group.name',
          appid: '$group.appid',
        },
      })
      .next()

    return res
  }

  async deleteInviteCode(inviteCode: GroupInviteCode, session?: ClientSession) {
    const res = await this.db
      .collection<GroupInviteCode>('GroupInviteCode')
      .deleteOne({ _id: inviteCode._id }, { session })
    return res
  }

  async deleteManyInviteCode(groupId: ObjectId, session?: ClientSession) {
    const res = await this.db
      .collection<GroupInviteCode>('GroupInviteCode')
      .deleteMany({ groupId }, { session })
    return res
  }
}
