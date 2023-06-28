import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export class AccountTransaction {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  accountId: ObjectId

  @ApiProperty()
  amount: number

  @ApiProperty()
  balance: number

  @ApiProperty()
  reward?: number

  @ApiProperty()
  message: string

  @ApiPropertyOptional({ type: String })
  orderId?: ObjectId

  @ApiPropertyOptional({ type: String })
  billingId?: ObjectId

  @ApiProperty()
  createdAt: Date

  constructor(partial: Partial<AccountTransaction>) {
    Object.assign(this, partial)
  }
}
