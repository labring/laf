import { ObjectId } from 'mongodb'
import type { User } from 'src/user/entities/user'

export interface NotificationProvider {
  sendNotification(
    content: string,
    config: any,
    user: User,
    payload?: any,
  ): Promise<unknown>
}

export class NotificationProviderConf {
  _id?: ObjectId
  type: string
  enable: boolean
  config: any
  createdAt: Date
  updatedAt: Date
}
