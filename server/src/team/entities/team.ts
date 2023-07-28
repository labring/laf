import { ObjectId } from 'mongodb'

export class Team {
  _id?: ObjectId
  name: string
  default: boolean
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}
