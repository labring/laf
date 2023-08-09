import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum GroupRole {
  Owner = 'owner',
  Admin = 'admin',
  Developer = 'developer',
}

const roleLevel = {
  [GroupRole.Owner]: 0b100,
  [GroupRole.Admin]: 0b010,
  [GroupRole.Developer]: 0b001,
} as const

export const getRoleLevel = (role: GroupRole) => {
  return roleLevel[role]
}

export class GroupMember {
  @ApiProperty({ type: 'string' })
  _id?: ObjectId

  @ApiProperty({ type: 'string' })
  uid: ObjectId

  @ApiProperty({ type: 'string' })
  groupId: ObjectId

  @ApiProperty({ enum: GroupRole })
  role: GroupRole

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
