import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class TeamInviteCode {
  @ApiProperty({ type: 'string' })
  _id?: ObjectId

  @ApiProperty()
  enable: boolean

  @ApiProperty()
  code: string

  @ApiProperty({ type: 'string' })
  teamId: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
