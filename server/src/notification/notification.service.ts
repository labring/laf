import { Injectable } from '@nestjs/common'
import { SystemDatabase } from 'src/system-database'
import type { User } from 'src/user/entities/user'
import { Notification, NotificationState } from './entities/notification'
import { TASK_LOCK_INIT_TIME } from 'src/constants'
import { I18nService } from 'nestjs-i18n'
import { NotificationType } from './notification-type'
import { ObjectId } from 'mongodb'

@Injectable()
export class NotificationService {
  constructor(private readonly i18n: I18nService) {}

  async notify(params: {
    type: NotificationType
    payload?: object
    uid?: ObjectId
  }) {
    const { type, payload, uid } = params

    const db = SystemDatabase.db
    await db.collection<Notification>('Notification').insertOne({
      title: this.getNotificationTitle(type, payload),
      content: this.genNotificationContent(type, payload),
      type,
      target: uid,
      state: NotificationState.Pending,
      lockedAt: TASK_LOCK_INIT_TIME,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  getNotificationTitle(type: NotificationType, payload?: object) {
    const title = this.i18n.t(`notification.${type}.title`, {
      args: payload,
    })
    return title
  }

  genNotificationContent(type: NotificationType, payload?: object) {
    const content = this.i18n.t(`notification.${type}.content`, {
      args: payload,
    })
    return content
  }

  async findAll(user: User, page: number, pageSize: number) {
    const db = SystemDatabase.db
    const list = db
      .collection<Notification>('Notification')
      .find(
        { target: user._id },
        {
          skip: (page - 1) * pageSize,
          limit: pageSize,
          sort: { createdAt: -1 },
        },
      )
      .toArray()

    const total = await db
      .collection<Notification>('Notification')
      .countDocuments({ target: user._id })

    return {
      list,
      total,
      page,
      pageSize,
    }
  }
}
