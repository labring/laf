import { ObjectId } from 'mongodb'

export type EnvironmentVariable = {
  name: string
  value: string
}

export class ApplicationConfiguration {
  _id?: ObjectId
  appid: string
  environments: EnvironmentVariable[]
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
}
