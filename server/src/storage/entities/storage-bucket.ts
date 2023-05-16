import { ObjectId } from 'mongodb'
import { StoragePhase, StorageState } from './storage-user'
import { WebsiteHosting } from 'src/website/entities/website'
import { BucketDomain } from 'src/gateway/entities/bucket-domain'

export enum BucketPolicy {
  readwrite = 'readwrite',
  readonly = 'readonly',
  private = 'private',
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

export type StorageWithRelations = StorageBucket & {
  domain: BucketDomain
  websiteHosting: WebsiteHosting
}
