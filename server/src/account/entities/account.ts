import { ObjectId } from 'mongodb'

export enum BaseState {
  Active = 'Active',
  Inactive = 'Inactive',
}

export class Account {
  _id?: ObjectId
  balance: number
  state: BaseState
  createdAt: Date
  updatedAt: Date
  createdBy: ObjectId

  constructor(partial: Partial<Account>) {
    Object.assign(this, partial)
  }
}
