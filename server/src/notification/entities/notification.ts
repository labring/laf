import { ApiProperty } from '@nestjs/swagger'
import { ObjectId } from 'mongodb'
import { NotificationType } from '../notification-type'

export enum NotificationState {
  Pending = 'Pending',
  Done = 'Done',
}

export class Notification {
  @ApiProperty({ type: String })
  _id?: ObjectId

  @ApiProperty({ enum: NotificationType })
  type: NotificationType

  @ApiProperty()
  title: string

  @ApiProperty()
  content: string

  @ApiProperty({ enum: NotificationState })
  state: NotificationState

  @ApiProperty({ type: String })
  target: ObjectId

  lockedAt: Date

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
