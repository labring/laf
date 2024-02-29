import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum BaseState {
  Active = 'Active',
  Inactive = 'Inactive',
}

export class Account {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({
    type: Date,
    required: false,
    description: 'The timestamp when the account became owed',
  })
  owedAt?: Date

  @ApiProperty()
  balance: number

  @ApiProperty({ enum: BaseState })
  state: BaseState

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: String })
  createdBy: ObjectId

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial)
  }
}
