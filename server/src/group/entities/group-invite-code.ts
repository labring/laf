import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { GroupRole } from './group-member'

export class GroupInviteCode {
  @ApiProperty({ type: 'string' })
  _id?: ObjectId

  @ApiPropertyOptional({ type: 'string' })
  usedBy?: ObjectId

  @ApiProperty()
  code: string

  @ApiProperty()
  role: GroupRole

  @ApiProperty({ type: 'string' })
  groupId: ObjectId

  @ApiProperty({ type: 'string' })
  createdBy: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
