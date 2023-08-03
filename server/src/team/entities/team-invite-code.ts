import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { TeamRole } from './team-member'

export class TeamInviteCode {
  @ApiProperty({ type: 'string' })
  _id?: ObjectId

  @ApiPropertyOptional({ type: 'string' })
  usedBy?: ObjectId

  @ApiProperty()
  code: string

  @ApiProperty()
  role: TeamRole

  @ApiProperty({ type: 'string' })
  teamId: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
