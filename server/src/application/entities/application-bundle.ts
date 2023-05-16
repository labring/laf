import { ObjectId } from 'mongodb'

export class ApplicationBundle {
  _id?: ObjectId
  appid: string
  resource: ApplicationBundleResource
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<ApplicationBundle>) {
    Object.assign(this, partial)
  }
}

export class ApplicationBundleResource {
  limitCPU: number
  limitMemory: number
  requestCPU: number
  requestMemory: number
  databaseCapacity: number
  storageCapacity: number
  limitCountOfCloudFunction: number
  limitCountOfBucket: number
  limitCountOfDatabasePolicy: number
  limitCountOfTrigger: number
  limitCountOfWebsiteHosting: number
  reservedTimeAfterExpired: number
  limitDatabaseTPS: number
  limitStorageTPS: number

  constructor(partial: Partial<ApplicationBundleResource>) {
    Object.assign(this, partial)
  }
}
