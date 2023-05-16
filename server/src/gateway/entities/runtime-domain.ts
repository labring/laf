import { ObjectId } from 'mongodb'

export enum DomainPhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum DomainState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export class RuntimeDomain {
  _id?: ObjectId
  appid: string
  domain: string
  state: DomainState
  phase: DomainPhase
  lockedAt: Date
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<RuntimeDomain>) {
    Object.assign(this, partial)
  }
}
