import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class GroupApplication {
  @ApiProperty({ type: 'string' })
  _id?: ObjectId

  @ApiProperty({ type: 'string' })
  groupId: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  createdAt: Date
}
