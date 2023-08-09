import { Injectable, Logger } from '@nestjs/common'

import { SystemDatabase } from 'src/system-database'
import { ClientSession, ObjectId } from 'mongodb'
import { GroupMember, GroupRole } from '../entities/group-member'
import { FindGroupMemberDto } from '../dto/find-group-member.dto'

@Injectable()
export class GroupMemberService {
  private readonly logger = new Logger(GroupMemberService.name)
  private readonly db = SystemDatabase.db

  async updateRole(groupId: ObjectId, uid: ObjectId, role: GroupRole) {
    const res = await this.db
      .collection<GroupMember>('GroupMember')
      .findOneAndUpdate(
        { groupId, uid },
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

  async findOne(groupId: ObjectId, uid: ObjectId, session?: ClientSession) {
    const res = await this.db.collection<GroupMember>('GroupMember').findOne(
      {
        groupId,
        uid,
      },
      {
        session,
      },
    )
    return res
  }

  async find(groupId: ObjectId) {
    const res = await this.db
      .collection<GroupMember>('GroupMember')
      .aggregate()
      .match({ groupId })
      .lookup({
        from: 'User',
        foreignField: '_id',
        localField: 'uid',
        as: 'user',
      })
      .unwind('$user')
      .project<FindGroupMemberDto>({
        _id: 0,
        uid: 1,
        role: 1,
        username: '$user.username',
        createdAt: 1,
        updatedAt: 1,
      })
      .toArray()

    return res
  }

  async addOne(
    groupId: ObjectId,
    uid: ObjectId,
    role: GroupRole,
    session?: ClientSession,
  ) {
    await this.db.collection<GroupMember>('GroupMember').insertOne(
      {
        groupId,
        uid,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        session,
      },
    )
    return await this.findOne(groupId, uid, session)
  }

  async removeOne(groupId: ObjectId, uid: ObjectId) {
    const res = await this.db.collection<GroupMember>('GroupMember').deleteOne({
      groupId,
      uid,
    })
    const ok = res.acknowledged && res.deletedCount > 0
    return [ok, res]
  }

  async removeAll(groupId: ObjectId, session?: ClientSession) {
    const res = await this.db.collection<GroupMember>('GroupMember').deleteMany(
      {
        groupId,
      },
      { session },
    )
    return res
  }

  async leaveGroup(groupId: ObjectId, uid: ObjectId) {
    const res = await this.db
      .collection<GroupMember>('GroupMember')
      .deleteOne({ groupId, uid })

    return res
  }
}
