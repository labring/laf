import { ObjectId } from 'mongodb'

export class GiftCode {
  _id?: ObjectId
  code: string
  creditAmount: number
  used: boolean
  usedBy?: ObjectId
  usedAt?: Date
  createdAt: Date
  expiredAt?: Date
  transactionId?: ObjectId
}
