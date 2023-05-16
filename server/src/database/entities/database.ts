import { ObjectId } from 'mongodb'

export enum DatabasePhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum DatabaseState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export class Database {
  _id?: ObjectId
  appid: string
  name: string
  user: string
  password: string
  state: DatabaseState
  phase: DatabasePhase
  lockedAt: Date
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<Database>) {
    Object.assign(this, partial)
  }
}
