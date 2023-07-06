import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/user/entities/user'
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

  @ApiProperty({
    type: [User],
  })
  user: User[]
}
