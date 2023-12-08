import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum DedicatedDatabasePhase {
  Starting = 'Starting',
  Started = 'Started',
  Stopping = 'Stopping',
  Stopped = 'Stopped',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum DedicatedDatabaseState {
  Running = 'Running',
  Stopped = 'Stopped',
  Restarting = 'Restarting',
  Deleted = 'Deleted',
}

export class DedicatedDatabaseSpec {
  @ApiProperty()
  limitCPU: number

  @ApiProperty()
  limitMemory: number

  @ApiProperty()
  requestCPU: number

  @ApiProperty()
  requestMemory: number

  @ApiProperty()
  capacity: number

  @ApiProperty()
  replicas: number
}

export class DedicatedDatabase {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  name: string

  @ApiProperty({ enum: DedicatedDatabaseState })
  state: DedicatedDatabaseState

  @ApiProperty({ enum: DedicatedDatabasePhase })
  phase: DedicatedDatabasePhase

  lockedAt: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
