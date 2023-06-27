import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class AccountChargeReward {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  amount: number

  @ApiProperty({})
  reward: number

  @ApiPropertyOptional()
  message?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
