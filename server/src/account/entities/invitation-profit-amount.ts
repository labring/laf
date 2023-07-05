import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class InvitationProfitAmount {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  settingName: string

  @ApiProperty()
  amount: number
}
