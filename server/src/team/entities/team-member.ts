import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum TeamRole {
  Owner = 'owner',
  Admin = 'admin',
  Developer = 'developer',
}

const roleLevel = {
  [TeamRole.Owner]: 0b100,
  [TeamRole.Admin]: 0b010,
  [TeamRole.Developer]: 0b001,
} as const

export const getRoleLevel = (role: TeamRole) => {
  return roleLevel[role]
}

export class TeamMember {
  @ApiProperty({ type: 'string' })
  id?: ObjectId

  @ApiProperty({ type: 'string' })
  uid: ObjectId

  @ApiProperty({ type: 'string' })
  teamId: ObjectId

  @ApiProperty({ enum: TeamRole })
  role: TeamRole

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
