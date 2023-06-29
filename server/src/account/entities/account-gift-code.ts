import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class GiftCode {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  creditAmount: number

  @ApiProperty({})
  used: boolean

  @ApiProperty()
  usedBy?: ObjectId

  @ApiProperty()
  usedAt?: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  transactionId?: ObjectId
}
