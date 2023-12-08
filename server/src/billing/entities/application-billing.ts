import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { ResourceType } from './resource'

export enum ApplicationBillingState {
  Pending = 'Pending',
  Done = 'Done',
}

export class ApplicationBillingDetailItem {
  @ApiProperty()
  usage: number

  @ApiProperty()
  amount: number
}

export class ApplicationBillingDetail {
  @ApiProperty()
  [ResourceType.CPU]: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.Memory]: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.DatabaseCapacity]: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.StorageCapacity]: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.NetworkTraffic]?: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.DedicatedDatabaseCPU]?: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.DedicatedDatabaseMemory]?: ApplicationBillingDetailItem;

  @ApiProperty()
  [ResourceType.DedicatedDatabaseCapacity]?: ApplicationBillingDetailItem
}

export class ApplicationBilling {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty()
  appid: string

  @ApiProperty({ enum: ApplicationBillingState })
  state: ApplicationBillingState

  @ApiProperty()
  amount: number

  @ApiProperty()
  detail: ApplicationBillingDetail

  @ApiProperty()
  startAt: Date

  @ApiProperty()
  endAt: Date

  lockedAt: Date

  @ApiProperty({ type: String })
  createdBy: ObjectId

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
