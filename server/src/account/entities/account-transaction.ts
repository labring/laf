import { ObjectId } from 'mongodb'

export class AccountTransaction {
  _id?: ObjectId
  accountId: ObjectId
  amount: number
  balance: number
  message: string
  orderId?: ObjectId
  billingId?: ObjectId
  createdAt: Date

  constructor(partial: Partial<AccountTransaction>) {
    Object.assign(this, partial)
  }
}
