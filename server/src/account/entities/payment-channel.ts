import { ObjectId } from 'mongodb'
import { PaymentChannelType } from './account-charge-order'
import { BaseState } from './account'

export class PaymentChannel<S = any> {
  _id?: ObjectId
  type: PaymentChannelType
  name: string
  spec: S
  state: BaseState
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<PaymentChannel<S>>) {
    Object.assign(this, partial)
  }
}
