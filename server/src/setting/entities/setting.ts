import { ObjectId } from 'mongodb'

export class Setting {
  _id?: ObjectId
  key: string
  value: string
  desc?: string
  metadata?: any
}
