import { ObjectId } from 'mongodb'
import { GroupRole } from './group-member'
import { ApiProperty } from '@nestjs/swagger'

export class Group {
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

export class GroupWithRole extends Group {
  @ApiProperty({ enum: GroupRole })
  role: GroupRole
}
