import { ObjectId } from 'mongodb'

export enum BucketPolicy {
  readwrite = 'readwrite',
  readonly = 'readonly',
  private = 'private',
}

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

export class StorageBucket {
  _id?: ObjectId
  appid: string
  name: string
  shortName: string
  policy: BucketPolicy
  state: StorageState
  phase: StoragePhase
  lockedAt: Date
  createdAt: Date
  updatedAt: Date
}
