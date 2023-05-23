import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum ResourceType {
  CPU = 'cpu',
  Memory = 'memory',
  DatabaseCapacity = 'databaseCapacity',
  StorageCapacity = 'storageCapacity',
  NetworkTraffic = 'networkTraffic',
}

export class ResourceSpec {
  @ApiProperty()
  value: number

  @ApiPropertyOptional()
  label?: string
}

export class ResourceOption {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  regionId: ObjectId

  @ApiProperty({ enum: ResourceType })
  type: ResourceType

  @ApiProperty()
  price: number

  @ApiProperty({ type: [ResourceSpec] })
  specs: ResourceSpec[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class ResourceBundleSpecMap {
  @ApiProperty({ type: ResourceSpec })
  [ResourceType.CPU]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.Memory]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.DatabaseCapacity]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.StorageCapacity]: ResourceSpec;

  @ApiPropertyOptional({ type: ResourceSpec })
  [ResourceType.NetworkTraffic]?: ResourceSpec
}

export class ResourceBundle {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ type: String })
  regionId: ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  displayName: string

  @ApiProperty({ type: ResourceBundleSpecMap })
  spec: {
    [ResourceType.CPU]: ResourceSpec
    [ResourceType.Memory]: ResourceSpec
    [ResourceType.DatabaseCapacity]: ResourceSpec
    [ResourceType.StorageCapacity]: ResourceSpec
    [ResourceType.NetworkTraffic]?: ResourceSpec
  }

  @ApiPropertyOptional()
  enableFreeTier?: boolean

  @ApiPropertyOptional()
  limitCountOfFreeTierPerUser?: number

  @ApiPropertyOptional()
  message?: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
