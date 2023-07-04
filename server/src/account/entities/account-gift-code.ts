import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum CodePrefix {
  FRM = 'FRM',
  GRP = 'GRP',
  GHC = 'GHC',
}

export class GiftCode {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  code: string

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
