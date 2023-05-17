import { ObjectId } from 'mongodb'
import { User } from './user'

export class PersonalAccessToken {
  _id?: ObjectId
  uid: ObjectId
  name: string
  token: string
  expiredAt: Date
  createdAt: Date
}

export type PersonalAccessTokenWithUser = PersonalAccessToken & {
  user: User
}
