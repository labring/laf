import { ObjectId } from 'mongodb'

export class TeamApplication {
  _id?: ObjectId
  teamId: ObjectId
  appid: string
  createdAt: Date
}
