import { ObjectId } from 'mongodb'
import { PaymentChannelType } from './account-charge-order'
import { BaseState } from './account'
import { ApiProperty } from '@nestjs/swagger'

export class PaymentChannel<S = any> {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ enum: PaymentChannelType, type: String })
  type: PaymentChannelType

  @ApiProperty()
  name: string

  @ApiProperty()
  spec: S

  @ApiProperty({ type: String, enum: BaseState })
  state: BaseState

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<PaymentChannel<S>>) {
    Object.assign(this, partial)
  }
}
