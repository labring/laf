import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { Autoscaling } from './application-configuration'
import { DedicatedDatabaseSpec } from 'src/database/entities/dedicated-database'

export class ApplicationBundleResource {
  @ApiProperty({ example: 500 })
  limitCPU: number

  @ApiProperty({ example: 1024 })
  limitMemory: number

  requestCPU: number
  requestMemory: number

  @ApiProperty({ example: 1024 })
  databaseCapacity: number

  @ApiProperty({ example: 1024 })
  storageCapacity: number

  @ApiProperty({ example: 100 })
  limitCountOfCloudFunction: number

  @ApiProperty({ example: 3 })
  limitCountOfBucket: number

  @ApiProperty({ example: 3 })
  limitCountOfDatabasePolicy: number

  @ApiProperty({ example: 1 })
  limitCountOfTrigger: number

  @ApiProperty({ example: 3 })
  limitCountOfWebsiteHosting: number

  @ApiProperty()
  reservedTimeAfterExpired: number

  limitDatabaseTPS: number
  limitStorageTPS: number

  @ApiProperty({ type: DedicatedDatabaseSpec })
  dedicatedDatabase: DedicatedDatabaseSpec

  constructor(partial: Partial<ApplicationBundleResource>) {
    Object.assign(this, partial)
  }
}

export class ApplicationBundle {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty()
  resource: ApplicationBundleResource

  @ApiProperty()
  autoscaling: Autoscaling

  @ApiPropertyOptional()
  isTrialTier?: boolean

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(partial: Partial<ApplicationBundle>) {
    Object.assign(this, partial)
  }
}
