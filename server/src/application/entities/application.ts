import { ObjectId } from 'mongodb'
import { Region } from 'src/region/entities/region'
import { ApplicationBundle } from './application-bundle'
import { Runtime } from './runtime'
import { ApplicationConfiguration } from './application-configuration'
import { RuntimeDomain } from 'src/gateway/entities/runtime-domain'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

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
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  appid: string

  @ApiProperty({ type: String })
  regionId: ObjectId

  @ApiProperty({ type: String })
  runtimeId: ObjectId

  @ApiProperty({ isArray: true, type: String })
  tags: string[]

  @ApiProperty({ enum: ApplicationState })
  state: ApplicationState

  @ApiProperty({ enum: ApplicationPhase })
  phase: ApplicationPhase

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  lockedAt: Date

  @ApiProperty({ type: String })
  createdBy: ObjectId

  billingLockedAt: Date

  latestBillingTime?: Date

  constructor(partial: Partial<Application>) {
    Object.assign(this, partial)
  }
}

export class ApplicationWithRelations extends Application {
  @ApiPropertyOptional()
  region?: Region

  @ApiPropertyOptional()
  bundle?: ApplicationBundle

  @ApiPropertyOptional()
  runtime?: Runtime

  @ApiPropertyOptional()
  configuration?: ApplicationConfiguration

  @ApiPropertyOptional()
  domain?: RuntimeDomain
}
