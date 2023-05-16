import { ObjectId } from 'mongodb'
import { DomainPhase, DomainState } from 'src/gateway/entities/runtime-domain'
import { StorageBucket } from 'src/storage/entities/storage-bucket'

export class WebsiteHosting {
  _id?: ObjectId
  appid: string
  bucketName: string
  domain: string
  isCustom: boolean
  state: DomainState
  phase: DomainPhase
  createdAt: Date
  updatedAt: Date
  lockedAt: Date

  constructor(partial: Partial<WebsiteHosting>) {
    Object.assign(this, partial)
  }
}

export type WebsiteHostingWithBucket = WebsiteHosting & {
  bucket: StorageBucket
}
