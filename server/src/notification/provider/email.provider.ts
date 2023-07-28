import { User } from 'src/user/entities/user'
import { NotificationProvider } from './interface'
import * as nodemailer from 'nodemailer'

export class EmailNotificationProvider implements NotificationProvider {
  static providerName = 'email'

  async sendNotification(
    content: string,
    config: any,
    user: User,
    payload?: any,
  ) {
    if (!user.email) return

    const transport = nodemailer.createTransport(config)
    await transport.sendMail({
      from: config.from,
      to: user.email,
      subject: payload?.subject,
      text: content,
    })
  }
}
