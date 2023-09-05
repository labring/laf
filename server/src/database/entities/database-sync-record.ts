import { ObjectId } from 'mongodb'

export class DatabaseSyncRecord {
  uid: ObjectId
  createdAt: Date
}
