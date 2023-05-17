import { ObjectId } from 'mongodb'

export enum TriggerState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export enum TriggerPhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export class CronTrigger {
  _id?: ObjectId
  appid: string
  desc: string
  cron: string
  target: string
  state: TriggerState
  phase: TriggerPhase
  lockedAt: Date
  createdAt: Date
  updatedAt: Date
}
