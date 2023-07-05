import { ObjectId } from 'mongodb'

export enum InviteCodeState {
  Enabled = 'Active',
  Disabled = 'Inactive',
}

export class InviteCode {
  _id?: ObjectId
  uid: ObjectId
  code: string
  state: InviteCodeState
  name?: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export class InviteRelation {
  _id?: ObjectId
  uid: ObjectId
  invitedBy: ObjectId
  codeId: ObjectId
  createdAt: Date
  transactionId?: ObjectId
}
