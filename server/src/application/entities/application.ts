import { ObjectId } from 'mongodb'
import { Region } from 'src/region/entities/region'
import { ApplicationBundle } from './application-bundle'
import { Runtime } from './runtime'
import { ApplicationConfiguration } from './application-configuration'

export enum ApplicationPhase {
  Creating = 'Creating',
  Created = 'Created',
  Starting = 'Starting',
  Started = 'Started',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum ApplicationState {
  Running = 'Running',
  Stopped = 'Stopped',
  Restarting = 'Restarting',
  Deleted = 'Deleted',
}

export class Application {
  _id?: ObjectId
  name: string
  appid: string
  regionId: ObjectId
  runtimeId: ObjectId
  tags: string[]
  state: ApplicationState
  phase: ApplicationPhase
  createdAt: Date
  updatedAt: Date
  lockedAt: Date
  createdBy: ObjectId

  constructor(partial: Partial<Application>) {
    Object.assign(this, partial)
  }
}

export interface ApplicationWithRelations extends Application {
  region?: Region
  bundle?: ApplicationBundle
  runtime?: Runtime
  configuration?: ApplicationConfiguration
}
