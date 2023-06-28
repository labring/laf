import { ObjectId } from 'mongodb'

export enum StoragePhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum StorageState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export class StorageUser {
  _id?: ObjectId
  appid: string
  accessKey: string
  secretKey: string
  state: StorageState
  phase: StoragePhase
  dataSize: number
  lockedAt: Date
  usageCaptureLockedAt: Date
  usageLimitLockedAt: Date
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<StorageUser>) {
    Object.assign(this, partial)
  }
}
