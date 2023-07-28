import { ObjectId } from 'mongodb'

export enum ApplicationReleasePhase {
  Pending = 'pending',
  Done = 'done',
  Cancel = 'cancel',
}

export class ApplicationRelease {
  _id?: ObjectId
  appid: string
  name: string
  createdBy: ObjectId
  phase: ApplicationReleasePhase
  createdAt: Date
  updatedAt: Date
  tickedAt: Date
  lockedAt: Date
}
