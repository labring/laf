import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'

export enum ResourceType {
  CPU = 'cpu',
  Memory = 'memory',
  DatabaseCapacity = 'databaseCapacity',
  StorageCapacity = 'storageCapacity',
  NetworkTraffic = 'networkTraffic',
  DedicatedDatabaseCPU = 'dedicatedDatabaseCPU',
  DedicatedDatabaseMemory = 'dedicatedDatabaseMemory',
  DedicatedDatabaseCapacity = 'dedicatedDatabaseCapacity',
  DedicatedDatabaseReplicas = 'dedicatedDatabaseReplicas',
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
  [ResourceType.NetworkTraffic]?: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.DedicatedDatabaseCPU]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.DedicatedDatabaseMemory]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.DedicatedDatabaseCapacity]: ResourceSpec;

  @ApiProperty({ type: ResourceSpec })
  [ResourceType.DedicatedDatabaseReplicas]: ResourceSpec
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
    [ResourceType.DedicatedDatabaseCPU]: ResourceSpec
    [ResourceType.DedicatedDatabaseMemory]: ResourceSpec
    [ResourceType.DedicatedDatabaseCapacity]: ResourceSpec
    [ResourceType.DedicatedDatabaseReplicas]: ResourceSpec
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
