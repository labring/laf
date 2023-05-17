import { ObjectId } from 'mongodb'

export class User {
  _id?: ObjectId
  username: string
  email?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}
