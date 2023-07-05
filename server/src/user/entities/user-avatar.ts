import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class UserAvatar {
  @ApiProperty({ type: Buffer })
  data: Buffer

  @ApiProperty({ type: String })
  createdBy: ObjectId

  @ApiProperty()
  createdAt: Date
}
