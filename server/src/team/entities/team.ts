import { ObjectId } from 'mongodb'
import { TeamRole } from './team-member'

export class Team {
  _id?: ObjectId
  name: string
  createdBy: ObjectId
  createdAt: Date
  updatedAt: Date
}

export class TeamWithRole extends Team {
  role: TeamRole
}
