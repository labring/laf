import { ObjectId } from 'mongodb'
import { TeamRole } from './team-member'
import { ApiProperty } from '@nestjs/swagger'

export class Team {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  appid?: string

  @ApiProperty({ type: String })
  createdBy: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class TeamWithRole extends Team {
  @ApiProperty({ enum: TeamRole })
  role: TeamRole
}
