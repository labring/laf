import { ObjectId } from 'mongodb'

export enum UserPasswordState {
  Active = 'Active',
  Inactive = 'Inactive',
}

export class UserPassword {
  _id?: ObjectId
  uid: ObjectId
  password: string
  state: UserPasswordState
  createdAt: Date
  updatedAt: Date
}
