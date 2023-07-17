import { Injectable, Logger } from '@nestjs/common'
import { EmailNotificationProvider } from './provider/email.provider'
import { SmsNotificationProvider } from './provider/sms.provider'
import {
  NotificationProvider,
  NotificationProviderConf,
} from './provider/interface'
import { SystemDatabase } from 'src/system-database'
import type { User } from 'src/user/entities/user'

const NotificationAdaptor: Record<string, NotificationProvider> = {
  [EmailNotificationProvider.providerName]: new EmailNotificationProvider(),
  [SmsNotificationProvider.providerName]: new SmsNotificationProvider(),
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  async getProviderConf(type: string) {
    const db = SystemDatabase.db
    return await db
      .collection<NotificationProviderConf>('NotificationProviderConf')
      .findOne({ type })
  }

  async send(type: string, content: string, user: User, payload?: any) {
    if (!NotificationAdaptor[type]) {
      this.logger.error(`invalid notification type: ${type}`)
      return
    }
    console.log('send notification', type, content, user, payload)
    return

    const conf = await this.getProviderConf(type)
    if (!conf || !conf.enable || !conf.config) return

    return await NotificationAdaptor[type].sendNotification(
      content,
      conf.config,
      user,
      payload,
    )
  }

  async sendAll(content: string, user: User, payload?: any) {
    return await Promise.all(
      Object.keys(NotificationAdaptor).map((type) =>
        this.send(type, content, user, payload),
      ),
    )
  }
}
