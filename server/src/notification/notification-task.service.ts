import { Cron, CronExpression } from '@nestjs/schedule'
import { SystemDatabase } from 'src/system-database'
import { Notification, NotificationState } from './entities/notification'
import { HttpService } from '@nestjs/axios'
import { Injectable, Logger } from '@nestjs/common'
import { ServerConfig } from 'src/constants'
import { UserService } from 'src/user/user.service'

@Injectable()
export class NotificationTaskService {
  private lockTimeout = 15 // in seconds
  private readonly logger = new Logger(NotificationTaskService.name)

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  tick() {
    if (ServerConfig.DISABLE_NOTIFICATION_TASK) return

    this.handlePendingNotifications()
  }

  async handlePendingNotifications() {
    const db = SystemDatabase.db

    const res = await db
      .collection<Notification>('Notification')
      .findOneAndUpdate(
        {
          state: NotificationState.Pending,
          lockedAt: {
            $lt: new Date(Date.now() - this.lockTimeout * 1000),
          },
        },
        {
          $set: {
            lockedAt: new Date(),
          },
        },
      )

    if (!res.value) return
    const notification = res.value

    const ok = await this.sendNotification(notification)
    if (!ok) return

    await db.collection<Notification>('Notification').updateOne(
      {
        _id: notification._id,
      },
      {
        $set: {
          state: NotificationState.Done,
          updatedAt: new Date(),
        },
      },
    )
  }

  async sendNotification(data: Notification) {
    if (!ServerConfig.NOTIFICATION_CENTER_URL) {
      return true
    }

    const user = await this.userService.findOneById(data.target)
    if (!user) {
      this.logger.error(`failed to send notification ${data._id}, no user`)
      return true
    }

    if (!user.email) {
      this.logger.log(`skip to send notification ${data._id} due to no channel`)
      return true
    }

    const to = [user.email].join('|')

    const res = await this.httpService.axiosRef.post(
      ServerConfig.NOTIFICATION_CENTER_URL,
      {
        title: data.title,
        description: data.content,
        token: ServerConfig.NOTIFICATION_CENTER_TOKEN,
        channel: 'notification',
        async: true,
        to: to,
      },
    )
    if (!res.data.success) {
      this.logger.error(`failed to send notification ${data._id}`, res.data)
      return false
    }
    return true
  }
}
