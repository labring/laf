import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class InviteCodeProfit {
  @ApiProperty({ type: String })
  _id: ObjectId

  @ApiProperty({ type: String })
  uid: ObjectId

  @ApiProperty({ type: String })
  invitedBy: ObjectId

  @ApiProperty({ type: String })
  codeId: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  profit: number

  @ApiProperty()
  username: string
}
