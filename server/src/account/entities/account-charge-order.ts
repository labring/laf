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
}

export class AccountChargeOrder<R = any> {
  _id?: ObjectId
  accountId: ObjectId
  amount: number
  currency: Currency
  phase: AccountChargePhase
  channel: PaymentChannelType
  result?: R
  message?: string
  createdAt: Date
  lockedAt: Date
  updatedAt: Date
  createdBy: ObjectId

  constructor(partial: Partial<AccountChargeOrder<R>>) {
    Object.assign(this, partial)
  }
}
