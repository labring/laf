import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum Currency {
  CNY = 'CNY',
  USD = 'USD',
}

export enum AccountChargePhase {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
}

export enum PaymentChannelType {
  Manual = 'Manual',
  Alipay = 'Alipay',
  WeChat = 'WeChat',
  Stripe = 'Stripe',
  Paypal = 'Paypal',
  Google = 'Google',
  GiftCode = 'GiftCode',
  InviteCode = 'InviteCode',
}

export class AccountChargeOrder<R = any> {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  accountId: ObjectId

  @ApiProperty()
  amount: number

  @ApiProperty({ enum: Currency })
  currency: Currency

  @ApiProperty({ enum: AccountChargePhase })
  phase: AccountChargePhase

  @ApiProperty({ enum: PaymentChannelType })
  channel: PaymentChannelType

  @ApiProperty()
  result?: R

  @ApiProperty()
  message?: string

  lockedAt: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  @ApiProperty({ type: String })
  createdBy: ObjectId

  constructor(partial: Partial<AccountChargeOrder<R>>) {
    Object.assign(this, partial)
  }
}
