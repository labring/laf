import { ObjectId } from 'mongodb'

export class UserProfile {
  _id?: ObjectId
  uid: ObjectId
  openData?: any
  avatar?: string
  name?: string
  createdAt: Date
  updatedAt: Date
}
