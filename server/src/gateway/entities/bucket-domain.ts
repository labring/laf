import { ObjectId } from 'mongodb'
import { DomainPhase, DomainState } from './runtime-domain'

export class BucketDomain {
  _id?: ObjectId
  appid: string
  bucketName: string
  domain: string
  state: DomainState
  phase: DomainPhase
  lockedAt: Date
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<BucketDomain>) {
    Object.assign(this, partial)
  }
}
