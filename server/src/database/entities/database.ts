import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum DatabasePhase {
  Creating = 'Creating',
  Created = 'Created',
  Deleting = 'Deleting',
  Deleted = 'Deleted',
}

export enum DatabaseState {
  Active = 'Active',
  Inactive = 'Inactive',
  Deleted = 'Deleted',
}

export enum DatabasePermission {
  Read = 'read',
  ReadWrite = 'readWrite',
}

export class Database {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  name: string

  @ApiProperty()
  user: string

  @ApiProperty()
  password: string

  @ApiProperty()
  dataSize: number

  @ApiProperty({ enum: DatabaseState })
  state: DatabaseState

  @ApiProperty({ enum: DatabasePhase })
  phase: DatabasePhase
  lockedAt: Date

  usageCaptureLockedAt: Date
  usageLimitLockedAt: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<Database>) {
    Object.assign(this, partial)
  }
}
