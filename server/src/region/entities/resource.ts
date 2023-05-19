import { ObjectId } from 'mongodb'

export enum ResourceType {
  CPU = 'cpu',
  Memory = 'memory',
  DatabaseCapacity = 'databaseCapacity',
  StorageCapacity = 'storageCapacity',
  NetworkTraffic = 'networkTraffic',
}

export interface ResourceSpec {
  value: number
  label?: string
}

export class ResourceOption {
  _id?: ObjectId
  regionId: ObjectId
  type: ResourceType
  price: number
  specs: ResourceSpec[]
  createdAt: Date
  updatedAt: Date
}

export class ResourceTemplate {
  _id?: ObjectId
  regionId: ObjectId
  name: string
  displayName: string
  spec: {
    [ResourceType.CPU]: ResourceSpec
    [ResourceType.Memory]: ResourceSpec
    [ResourceType.DatabaseCapacity]: ResourceSpec
    [ResourceType.StorageCapacity]: ResourceSpec
    [ResourceType.NetworkTraffic]?: ResourceSpec
  }
  enableFreeTier?: boolean
  limitCountOfFreeTierPerUser?: number
  message?: string
  createdAt: Date
  updatedAt: Date
}
