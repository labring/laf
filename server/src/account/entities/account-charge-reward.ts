import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class AccountChargeReward {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  amount: number

  @ApiProperty({})
  reward: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
